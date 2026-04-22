import re

with open('CkdPrediction.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change export default function PatientPredictionPage() to export default function CkdPrediction({ onBack }: { onBack: () => void })
content = content.replace('export default function PatientPredictionPage() {', 'export default function CkdPrediction({ onBack }: { onBack: () => void }) {')

# 2. Change TOTAL_STEPS to 7
content = content.replace('const TOTAL_STEPS = 8;', 'const TOTAL_STEPS = 7;')

# 3. Remove Step 8 from stepsConfig
content = re.sub(r'\{ num: 8, label: "Upload Reports",.*?\},?\n?', '', content)

# 4. Remove the block corresponding to Step 8 (Upload Reports).
idx_step8 = content.find('{step === 8 && (')
idx_step9 = content.find('{step === (9 as StepNumber) && (')

if idx_step8 != -1 and idx_step9 != -1:
    content = content[:idx_step8] + content[idx_step9:]

# 5. Change step 9 to step 8
content = content.replace('step === (9 as StepNumber)', 'step === (8 as StepNumber)')
content = content.replace('setStep(9 as StepNumber)', 'setStep(8 as StepNumber)')

# 6. Replace old_button
old_button = """<button
                            onClick={prevStep}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-light bg-white text-text-secondary font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>"""

new_button = """<button
                            onClick={step === 1 ? onBack : prevStep}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-light bg-white text-text-secondary font-semibold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Select Model' : 'Back'}
                        </button>"""

content = content.replace(old_button, new_button)

with open('CkdPrediction.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Refactored CkdPrediction.tsx')
