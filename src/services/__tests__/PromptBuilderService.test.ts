import test from 'node:test';
import assert from 'node:assert/strict';
import PromptBuilderService from '../PromptBuilderService';

test('buildFallbackAnalysisResult returns a simple explanation when AI parsing fails', () => {
  const result = PromptBuilderService.buildFallbackAnalysisResult(
    'This health insurance plan covers hospitalisation up to 5 lakh. Waiting period is 30 days for pre-existing diseases.',
    undefined
  );

  const summary = result.document_analysis.ai_generated_knowledge.policy_summary;

  assert.ok(
    summary.what_is_covered.toLowerCase().includes('hospital') ||
    summary.what_is_covered.toLowerCase().includes('coverage') ||
    summary.what_is_covered.toLowerCase().includes('medical')
  );
  assert.ok(summary.what_is_not_covered.length > 0);
  assert.ok(summary.key_points.length > 0);
});
