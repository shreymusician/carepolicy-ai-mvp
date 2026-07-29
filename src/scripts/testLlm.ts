import ConfigService from '../config/service';
import LlmService from '../services/LlmService';

async function run() {
  try {
    console.log('Config LLM provider:', ConfigService.llm.provider);
    const prompt = 'Return a single short JSON: {"hello":"world"}';
    console.log('Sending prompt...');
    const res = await LlmService.analyze(prompt);
    console.log('LLM response length:', res.length);
    console.log('Response preview:', res.slice(0, 500));
  } catch (err) {
    console.error('LLM test failed:', err instanceof Error ? err.message : String(err));
    if (err && typeof err === 'object') console.error(err);
    process.exit(1);
  }
}

run();
