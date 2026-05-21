/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');

function parseMarkdown(content, type) {
  const lines = content.split('\n');
  const questions = [];
  let currentQuestion = null;
  let state = 'SEARCHING'; // SEARCHING, CONTENT, OPTIONS, EXPLANATION

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match question start
    // "Question 1", "### 1.", "**1.**", "## 1. Title"
    const isQuestionStart = /^(Question \d+|### \d+\.|\*\*\d+\.\*\*|## \d+\.)/.test(line);

    if (isQuestionStart) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        content: '',
        options: [],
        correctAnswer: '',
        explanation: '',
        simuladoType: type
      };
      
      // If it's "**1.** content", we might need to extract the content part
      const match = line.match(/^(\*\*\d+\.\*\*|## \d+\.[ \w]*)\s*(.*)/);
      if (match && match[2] && match[2].trim()) {
         currentQuestion.content += match[2].trim() + '\n';
      } else if (!line.startsWith('Question') && !line.startsWith('###') && !line.startsWith('##')) {
         // for any remaining cases
         currentQuestion.content += line + '\n';
      }

      state = 'CONTENT';
      continue;
    }

    if (!currentQuestion) continue;

    // Match options like "A. ", "A) "
    const isOption = /^[A-E][\.\)]\s/.test(line);
    if (isOption && state !== 'EXPLANATION') {
      state = 'OPTIONS';
      currentQuestion.options.push(line);
      continue;
    }

    if (state === 'OPTIONS' && line !== '' && !line.match(/^(Answer:|Correct Answer:|> \*\*Answer:\*\*|Explanation:)/i)) {
      // Append to the last option if it's a multiline option
      // But only if it doesn't look like another option or answer
      if (!/^[A-E][\.\)]/.test(line)) {
        currentQuestion.options[currentQuestion.options.length - 1] += ' ' + line;
      }
      continue;
    }

    // Match Answer
    const answerMatch = line.match(/^(?:Correct )?Answer:\s*([A-E].*)|>\s*\*\*Answer:\*\*\s*([A-E].*)/i);
    if (answerMatch) {
      currentQuestion.correctAnswer = (answerMatch[1] || answerMatch[2]).trim();
      state = 'EXPLANATION'; // expecting explanation next
      continue;
    }

    // Match Explanation
    const expMatch = line.match(/^Explanation:\s*(.*)/i);
    if (expMatch) {
      currentQuestion.explanation = expMatch[1].trim() + '\n';
      state = 'EXPLANATION';
      continue;
    }

    if (state === 'CONTENT') {
      if (line) {
        currentQuestion.content += line + '\n';
      }
    } else if (state === 'EXPLANATION') {
      if (line && !line.startsWith('---')) {
        currentQuestion.explanation += line + '\n';
      }
    }
  }

  if (currentQuestion) questions.push(currentQuestion);

  // cleanup fields
  return questions.map(q => {
    q.content = q.content.trim();
    q.explanation = q.explanation ? q.explanation.trim() : null;
    return q;
  });
}

function run() {
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md') && f.startsWith('Simulado'));
  
  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    let type = 'v2';
    if (file.includes('V3')) type = 'v3';
    else if (file.includes('V4')) type = 'v4';
    else if (file === 'Simulado.md') type = 'v1';
    
    const parsed = parseMarkdown(content, type);
    console.log(`Parsed ${parsed.length} questions from ${file}`);
    
    const jsonPath = path.join(docsDir, file.replace('.md', '.json'));
    fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2));
    console.log(`Saved to ${jsonPath}`);
  }
}

run();
