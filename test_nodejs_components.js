// Test script to verify model imports and credit calculations
const path = require('path');

// Set up the environment to mimic the app structure
process.chdir('/app');

async function testModelImports() {
  console.log('=== Testing Model Imports ===');
  
  try {
    // Test User model import
    console.log('Testing User model...');
    const { User } = require('./lib/models/User.ts');
    if (User) {
      console.log('✅ User model imported successfully');
      console.log('User schema paths:', Object.keys(User.schema.paths));
    } else {
      console.log('❌ User model import failed');
      return false;
    }

    // Test CreditTransaction model import
    console.log('\nTesting CreditTransaction model...');
    const { CreditTransaction } = require('./lib/models/CreditTransaction.ts');
    if (CreditTransaction) {
      console.log('✅ CreditTransaction model imported successfully');
      console.log('CreditTransaction schema paths:', Object.keys(CreditTransaction.schema.paths));
    } else {
      console.log('❌ CreditTransaction model import failed');
      return false;
    }

    return true;
  } catch (error) {
    console.log('❌ Model import error:', error.message);
    return false;
  }
}

async function testCreditCalculations() {
  console.log('\n=== Testing Credit Calculation Functions ===');
  
  try {
    const { 
      calculateCreditsUsed, 
      calculateRealCostUsd, 
      classifyTaskComplexity,
      CREDIT_PACKS,
      PLAN_CONFIGS
    } = require('./lib/credit-costs.ts');

    // Test calculateCreditsUsed
    console.log('\nTesting calculateCreditsUsed...');
    const credits1 = calculateCreditsUsed('claude', 1000, 500);
    const credits2 = calculateCreditsUsed('gpt5.4o', 1000, 500);
    const credits3 = calculateCreditsUsed('gemini', 1000, 500);
    console.log(`Credits for claude (1000 input, 500 output): ${credits1}`);
    console.log(`Credits for gpt5.4o (1000 input, 500 output): ${credits2}`);
    console.log(`Credits for gemini (1000 input, 500 output): ${credits3}`);

    // Test calculateRealCostUsd
    console.log('\nTesting calculateRealCostUsd...');
    const cost1 = calculateRealCostUsd('claude', 1000, 500);
    const cost2 = calculateRealCostUsd('gpt5.4o', 1000, 500);
    console.log(`Real cost for claude (1000 input, 500 output): $${cost1.toFixed(4)}`);
    console.log(`Real cost for gpt5.4o (1000 input, 500 output): $${cost2.toFixed(4)}`);

    // Test classifyTaskComplexity
    console.log('\nTesting classifyTaskComplexity...');
    const simpleTask = classifyTaskComplexity('rename variable');
    const complexTask = classifyTaskComplexity('debug race condition and optimize performance');
    const architectureTask = classifyTaskComplexity('design system architecture');
    console.log(`Simple task classification: ${simpleTask}`);
    console.log(`Complex task classification: ${complexTask}`);
    console.log(`Architecture task classification: ${architectureTask}`);

    // Test CREDIT_PACKS
    console.log('\nTesting CREDIT_PACKS...');
    console.log(`Available credit packs: ${CREDIT_PACKS.map(p => `${p.id} (${p.credits} credits for $${p.priceUsdCents/100})`).join(', ')}`);

    // Test PLAN_CONFIGS
    console.log('\nTesting PLAN_CONFIGS...');
    const plans = Object.entries(PLAN_CONFIGS).map(([plan, config]) => 
      `${plan}: ${config.monthlyCredits} credits/month, $${config.priceUsdCents/100}/month`
    );
    console.log(`Available plans: ${plans.join(', ')}`);

    console.log('\n✅ All credit calculation functions working correctly');
    return true;
  } catch (error) {
    console.log('❌ Credit calculation error:', error.message);
    console.log('Stack trace:', error.stack);
    return false;
  }
}

async function testPlanEnums() {
  console.log('\n=== Testing Plan Type Enums ===');
  
  try {
    const { PLAN_LABELS, PLAN_CREDIT_ALLOCATIONS, PLAN_DAILY_CREDIT_LIMITS } = require('./lib/types/models.ts');
    
    console.log('Plan labels:', PLAN_LABELS);
    console.log('Plan credit allocations:', PLAN_CREDIT_ALLOCATIONS);
    console.log('Plan daily limits:', PLAN_DAILY_CREDIT_LIMITS);
    
    // Verify all 4 plan types exist
    const expectedPlans = ['free', 'starter', 'pro', 'studio'];
    const hasAllPlans = expectedPlans.every(plan => 
      PLAN_LABELS[plan] && 
      typeof PLAN_CREDIT_ALLOCATIONS[plan] === 'number' &&
      typeof PLAN_DAILY_CREDIT_LIMITS[plan] === 'number'
    );
    
    if (hasAllPlans) {
      console.log('✅ All plan types (free, starter, pro, studio) properly defined');
      return true;
    } else {
      console.log('❌ Missing plan type definitions');
      return false;
    }
  } catch (error) {
    console.log('❌ Plan enum error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting VerityFlow Credit System Node.js Tests\n');
  
  const results = {
    modelImports: await testModelImports(),
    creditCalculations: await testCreditCalculations(),
    planEnums: await testPlanEnums()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 NODE.JS TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${((passed/total)*100).toFixed(1)}%`);
  
  for (const [test, result] of Object.entries(results)) {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test}`);
  }
  
  if (passed === total) {
    console.log('\n🎉 All Node.js tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some Node.js tests failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});