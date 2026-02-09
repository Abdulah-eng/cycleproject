'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'

interface UploadProgress {
  total: number
  processed: number
  successful: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

export default function CSVUpload() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState('')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
      setError('')
    } else {
      setError('Please upload a CSV file')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setError('')
    } else {
      setError('Please upload a CSV file')
    }
  }

  const handleUpload = () => {
    if (!file) return

    setUploading(true)
    setError('')

    // Initialize progress
    const currentProgress: UploadProgress = {
      total: 0, // Will be updated as we parse
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    }
    setProgress(currentProgress)

    const BATCH_SIZE = 10
    let batch: any[] = []
    let totalRows = 0

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: false, // Disable worker to ensure pause/resume works correctly
      step: async (results: Papa.ParseStepResult<any>, parser: Papa.Parser) => {
        // results.data is a single row object because of step
        if (results.errors.length > 0) {
          console.error("Row error:", results.errors)
          return
        }

        batch.push(results.data)
        totalRows++

        // Update total estimate (rough) or just use processed count
        // Since we don't know total upfront easily with step, we update processed

        if (batch.length >= BATCH_SIZE) {
          parser.pause() // Pause parsing to upload

          try {
            await uploadBatch(batch)

            // Update progress
            currentProgress.processed += batch.length
            currentProgress.total = totalRows // tracking rows seen so far
            // successful/failed updated in uploadBatch or here?
            // We'll update state relative to previous
            setProgress(prev => {
              if (!prev) return currentProgress
              return {
                ...prev,
                total: totalRows, // dynamic total
                processed: prev.processed + batch.length
              }
            })

            batch = [] // Clear batch
            parser.resume()
          } catch (err: any) {
            console.error("Batch upload failed", err)
            setError(`Upload failed: ${err.message}`)
            parser.abort()
            setUploading(false)
          }
        }
      },
      complete: async () => {
        // Upload remaining rows
        if (batch.length > 0) {
          try {
            await uploadBatch(batch)
            currentProgress.processed += batch.length
            setProgress(prev => ({
              ...prev!,
              total: totalRows,
              processed: (prev?.processed || 0) + batch.length
            }))
          } catch (err: any) {
            setError(`Final batch failed: ${err.message}`)
          }
        }

        setUploading(false)
        if (currentProgress.successful > 0) {
          setTimeout(() => {
            router.push('/admin/dashboard')
          }, 3000)
        }
      },
      error: (err: Error) => {
        setError(`CSV Parse Error: ${err.message}`)
        setUploading(false)
      }
    })
  }

  const uploadBatch = async (rows: any[]) => {
    const response = await fetch('/api/admin/bikes/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rows }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const result = await response.json()

    // Update progress with server results
    setProgress(prev => {
      if (!prev) return null
      return {
        ...prev,
        successful: prev.successful + result.successful,
        failed: prev.failed + result.failed,
        errors: [...prev.errors, ...result.errors] // Append new errors
      }
    })
  }

  const resetUpload = () => {
    setFile(null)
    setProgress(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload CSV</h1>
        <p className="text-gray-600">Bulk upload bikes from a CSV file. <span className="text-green-600 font-medium">Large files supported (processed in batches).</span></p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {progress && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Results</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">{progress.processed}</div>
              <div className="text-sm text-gray-600">Rows Scanned</div>
            </div>
            {/* Removed 'Total' because it's dynamic now */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{progress.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{progress.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{uploading ? '...' : (progress.failed === 0 && progress.successful > 0 ? '100%' : 'Done')}</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>

          {progress.errors.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Errors:</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {progress.errors.map((err, idx) => (
                  <div key={idx} className="bg-red-50 text-red-700 p-3 rounded text-sm">
                    <span className="font-semibold">Row {err.row}:</span> {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!uploading && progress.successful > 0 && (
            <div className="mt-4 text-center text-green-600 font-semibold">
              ✓ Upload completed! Redirecting to dashboard...
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* CSV Format Instructions */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 CSV Format Requirements</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Required columns:</strong> brand, model, year, category</p>
            <p><strong>Localization:</strong> <code>speed_reason</code>, <code>bike_desc_fr</code>, <code>speed_reason_de</code>, etc.</p>
            <p><strong>Note:</strong> The CSV format should match your existing data format.</p>
            <p className="mt-4">
              <a href="/sample-bikes.csv" download className="text-blue-600 hover:text-blue-700 font-semibold underline">
                📥 Download simplified sample CSV template
              </a>
            </p>
          </div>
        </div>

        {/* Upload Area */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
          >
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isDragging ? 'Drop your file here' : 'Drag and drop your CSV file'}
            </h3>
            <p className="text-gray-600 mb-6">or</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all transform hover:scale-105"
            >
              Browse Files
            </label>
            <p className="text-sm text-gray-500 mt-4">Only CSV files are supported</p>
          </div>
        ) : (
          <div>
            {/* File Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">📄</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{file.name}</h3>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  disabled={uploading}
                  className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  '📤 Upload CSV'
                )}
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                disabled={uploading}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
