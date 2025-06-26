
import React from 'react';
import { Section } from './components/Section';
import { CodeBlock } from './components/CodeBlock';
import { PINE_SCRIPT_CODE, GENERATION_PROMPT } from './constants';

const App: React.FC = () => {
  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-sky-400">Pine Script Market Structure</h1>
        <p className="text-lg text-gray-400 mt-2">
          Displaying a TradingView Pine Script for market structure analysis and its generation prompt.
        </p>
      </header>

      <div className="space-y-12">
        <Section title="Pine Script v5 Code">
          <CodeBlock code={PINE_SCRIPT_CODE} language="pinescript" />
        </Section>

        <Section title="AI Generation Prompt">
          <CodeBlock code={GENERATION_PROMPT} language="text" />
        </Section>
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-700 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Market Structure Analyzer. For educational purposes.</p>
      </footer>
    </div>
  );
};

export default App;
    