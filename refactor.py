import re

file_path = r'd:\Fyp Dignosis\medi_intel\app\(dashboard)\patient\prediction\CkdPrediction.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove drag handlers
content = re.sub(r'const handleDragOver.*?\}', '', content, flags=re.DOTALL)

# To be safe, let's just do targeted string replacements for the big blocks

# Remove handleExtractReport
content = re.sub(r'const handleExtractReport = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?\n    \};\n', '', content, flags=re.DOTALL)

# Remove analyzeReports
content = re.sub(r'// -- Report Analysis --------------------------------------------------------.*?    \};\n', '', content, flags=re.DOTALL)

# Fix resetPrediction
content = content.replace('setUploadedFiles([]);\n', '')
content = content.replace('setReportAnalyses([]);\n', '')
content = content.replace('fileObjectsRef.current.clear();\n', '')

# Remove STEP 0
content = re.sub(r'\{\/\* ------- STEP 0: Entry Method ------- \*\/}.*?<\/motion\.div>\n\s*\)\}', '', content, flags=re.DOTALL)

# Remove OCR Warning
content = re.sub(r'\{\/\* ------- OCR Warning Message ------- \*\/}.*?<\/motion\.div>\n\s*\)\}', '', content, flags=re.DOTALL)

# Remove entryMethod checks
content = content.replace('{entryMethod !== "CHOOSING" && ', '{')
content = content.replace('entryMethod !== "CHOOSING" && ', '')

# Fix checklist
content = content.replace('tunned_kidney_Cancer_model.pkl', 'Kidney_Disease_Prediction_model.pkl')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Refactoring complete.')
