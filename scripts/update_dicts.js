const fs = require('fs');
const path = require('path');

const dictsDir = path.join(__dirname, '../dictionaries');
const files = fs.readdirSync(dictsDir).filter(f => f.endsWith('.json'));

const translations = {
  en: { score_summary: "Score Summary", show_explanations: "Show Explanations", hide_explanations: "Hide Explanations", add_to_compare: "Add to Compare", remove_from_compare: "Remove from Compare", added: "Added", rating: "Rating" },
  de: { score_summary: "Ergebnis-Zusammenfassung", show_explanations: "Erklärungen anzeigen", hide_explanations: "Erklärungen ausblenden", add_to_compare: "Vergleichen", remove_from_compare: "Aus Vergleich entfernen", added: "Hinzugefügt", rating: "Bewertung" },
  es: { score_summary: "Resumen de puntuación", show_explanations: "Mostrar explicaciones", hide_explanations: "Ocultar explicaciones", add_to_compare: "Añadir a comparar", remove_from_compare: "Quitar de comparar", added: "Añadido", rating: "Valoración" },
  fr: { score_summary: "Résumé des scores", show_explanations: "Afficher les explications", hide_explanations: "Masquer les explications", add_to_compare: "Ajouter au comparateur", remove_from_compare: "Retirer du comparateur", added: "Ajouté", rating: "Évaluation" },
  it: { score_summary: "Riepilogo punteggi", show_explanations: "Mostra spiegazioni", hide_explanations: "Nascondi spiegazioni", add_to_compare: "Aggiungi al confronto", remove_from_compare: "Rimuovi dal confronto", added: "Aggiunto", rating: "Valutazione" },
  nl: { score_summary: "Score samenvatting", show_explanations: "Uitleg tonen", hide_explanations: "Uitleg verbergen", add_to_compare: "Toevoegen aan vergelijking", remove_from_compare: "Verwijderen uit vergelijking", added: "Toegevoegd", rating: "Beoordeling" }
};

for (const file of files) {
  const lang = path.basename(file, '.json');
  if (!translations[lang]) continue;
  
  const filePath = path.join(dictsDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.common) data.common = {};
  
  Object.assign(data.common, translations[lang]);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${file}`);
}
