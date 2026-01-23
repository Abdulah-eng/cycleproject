'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

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

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setProgress(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/bikes/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      setProgress(result)

      if (result.successful > 0) {
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
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
        <p className="text-gray-600">Bulk upload bikes from a CSV file</p>
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
              <div className="text-3xl font-bold text-gray-900">{progress.total}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{progress.processed}</div>
              <div className="text-sm text-gray-600">Processed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{progress.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{progress.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
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

          {progress.successful > 0 && (
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
            <p><strong>Optional columns:</strong> sub_category, price, weight, frame, groupset, wheels, tires, brakes, fork, suspension, motor, battery, and many more component fields</p>
            <p><strong>Categories:</strong> Road, Mountain, Gravel, Electric, Hybrid</p>
            <p><strong>Note:</strong> The CSV format should match your existing data format (sample_for_website.csv)</p>
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
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging
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
                      {(file.size / 1024).toFixed(2)} KB
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

      {/* Tips */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-3">💡 Tips for Success</h3>
        <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
          <li>Ensure all required fields (brand, model, year, category) are filled</li>
          <li>Use consistent category names: Road, Mountain, Gravel, Electric, or Hybrid</li>
          <li>Price should be numeric (currency symbols are OK, they will be stripped)</li>
          <li>Weight can include units (e.g., "8.5 kg" or "18.7 lbs")</li>
          <li>Images column should contain comma-separated URLs</li>
          <li>The system will automatically generate slugs for each bike</li>
          <li>Large files may take a few minutes to process</li>
          <li>You can use the same format as sample_for_website.csv with all columns</li>
        </ul>
      </div>
    </div>
  )
}
