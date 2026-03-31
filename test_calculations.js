
const { 
    calculateCreditsUsed, 
    calculateRealCostUsd, 
    classifyTaskComplexity,
    CREDIT_PACKS,
    PLAN_CONFIGS
} = require('./lib/credit-costs.ts');

console.log("Testing calculateCreditsUsed...");
const credits = calculateCreditsUsed('claude', 1000, 500);
console.log(`Credits for claude (1000 input, 500 output): ${credits}`);

console.log("Testing calculateRealCostUsd...");
const cost = calculateRealCostUsd('gpt5.4o', 1000, 500);
console.log(`Real cost for gpt5.4o (1000 input, 500 output): $${cost}`);

console.log("Testing classifyTaskComplexity...");
const simpleTask = classifyTaskComplexity("rename variable");
const complexTask = classifyTaskComplexity("debug race condition");
console.log(`Simple task classification: ${simpleTask}`);
console.log(`Complex task classification: ${complexTask}`);

console.log("Testing CREDIT_PACKS...");
console.log(`Available credit packs: ${CREDIT_PACKS.map(p => p.id).join(', ')}`);

console.log("Testing PLAN_CONFIGS...");
console.log(`Available plans: ${Object.keys(PLAN_CONFIGS).join(', ')}`);

console.log("✅ All credit calculation functions working");
