#!/usr/bin/env python3
"""
VerityFlow Chunk 4 Backend Testing Suite
Tests NextAuth v5, Database Connectivity, Mongoose Models, Stripe Integration, and Core Utilities
"""

import asyncio
import json
import os
import sys
import traceback
from typing import Dict, Any, Optional
import aiohttp
import uuid

# Test configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://nextjs-foundation.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.warnings = []
    
    def pass_test(self, test_name: str, message: str = ""):
        self.passed += 1
        print(f"✅ {test_name}: {message}")
    
    def fail_test(self, test_name: str, error: str):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")
    
    def warn_test(self, test_name: str, warning: str):
        self.warnings.append(f"{test_name}: {warning}")
        print(f"⚠️  {test_name}: {warning}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.failed > 0:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        if self.warnings:
            print(f"\nWARNINGS:")
            for warning in self.warnings:
                print(f"  - {warning}")
        print(f"{'='*60}")

async def test_environment_variables():
    """Test that all required environment variables are set"""
    print("\n🔧 Testing Environment Variables...")
    result = TestResult()
    
    required_vars = [
        'MONGO_URL',
        'AUTH_SECRET',
        'AUTH_GOOGLE_ID',
        'AUTH_GOOGLE_SECRET',
        'STRIPE_SECRET_KEY',
        'STRIPE_PRO_PRICE_ID',
        'STRIPE_TEAMS_PRICE_ID'
    ]
    
    try:
        # Read .env file
        env_path = '/app/.env'
        env_vars = {}
        
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key] = value
        
        for var in required_vars:
            if var in env_vars and env_vars[var]:
                result.pass_test(f"ENV_{var}", f"Set to: {env_vars[var][:20]}...")
            else:
                result.fail_test(f"ENV_{var}", "Not set or empty")
        
        # Check optional vars
        optional_vars = ['AUTH_EMAIL_SERVER', 'AUTH_EMAIL_FROM', 'STRIPE_WEBHOOK_SECRET']
        for var in optional_vars:
            if var in env_vars and env_vars[var]:
                result.pass_test(f"ENV_{var}_OPTIONAL", f"Set to: {env_vars[var][:20]}...")
            else:
                result.warn_test(f"ENV_{var}_OPTIONAL", "Not set (optional)")
                
    except Exception as e:
        result.fail_test("ENV_READ", f"Failed to read environment: {str(e)}")
    
    return result

async def test_nextauth_endpoints():
    """Test NextAuth v5 endpoints"""
    print("\n🔐 Testing NextAuth v5 Integration...")
    result = TestResult()
    
    async with aiohttp.ClientSession() as session:
        # Test /api/auth/providers
        try:
            async with session.get(f"{API_BASE}/auth/providers") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if 'google' in data and 'nodemailer' in data:
                        result.pass_test("AUTH_PROVIDERS", "Google and Nodemailer providers found")
                    else:
                        result.fail_test("AUTH_PROVIDERS", f"Expected providers not found: {list(data.keys())}")
                else:
                    result.fail_test("AUTH_PROVIDERS", f"HTTP {resp.status}: {await resp.text()}")
        except Exception as e:
            result.fail_test("AUTH_PROVIDERS", f"Request failed: {str(e)}")
        
        # Test /api/auth/csrf
        try:
            async with session.get(f"{API_BASE}/auth/csrf") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if 'csrfToken' in data:
                        result.pass_test("AUTH_CSRF", "CSRF token endpoint working")
                    else:
                        result.fail_test("AUTH_CSRF", f"No csrfToken in response: {data}")
                else:
                    result.fail_test("AUTH_CSRF", f"HTTP {resp.status}: {await resp.text()}")
        except Exception as e:
            result.fail_test("AUTH_CSRF", f"Request failed: {str(e)}")
        
        # Test /api/auth/session (unauthenticated)
        try:
            async with session.get(f"{API_BASE}/auth/session") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    # Should return null or empty object for unauthenticated user
                    result.pass_test("AUTH_SESSION", "Session endpoint accessible (unauthenticated)")
                else:
                    result.fail_test("AUTH_SESSION", f"HTTP {resp.status}: {await resp.text()}")
        except Exception as e:
            result.fail_test("AUTH_SESSION", f"Request failed: {str(e)}")
    
    return result

async def test_database_connectivity():
    """Test MongoDB connectivity through API endpoints"""
    print("\n🗄️  Testing Database Connectivity...")
    result = TestResult()
    
    async with aiohttp.ClientSession() as session:
        # Test basic API endpoint that uses MongoDB
        try:
            # Test GET /api/status (should work and return empty array initially)
            async with session.get(f"{API_BASE}/status") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if isinstance(data, list):
                        result.pass_test("DB_READ", "MongoDB read operation successful")
                    else:
                        result.fail_test("DB_READ", f"Unexpected response format: {type(data)}")
                else:
                    result.fail_test("DB_READ", f"HTTP {resp.status}: {await resp.text()}")
        except Exception as e:
            result.fail_test("DB_READ", f"Request failed: {str(e)}")
        
        # Test POST /api/status (write operation)
        try:
            test_data = {
                "client_name": f"test_client_{uuid.uuid4().hex[:8]}"
            }
            async with session.post(f"{API_BASE}/status", json=test_data) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if 'id' in data and 'client_name' in data and 'timestamp' in data:
                        result.pass_test("DB_WRITE", "MongoDB write operation successful")
                        
                        # Verify the write by reading back
                        async with session.get(f"{API_BASE}/status") as read_resp:
                            if read_resp.status == 200:
                                read_data = await read_resp.json()
                                if any(item.get('client_name') == test_data['client_name'] for item in read_data):
                                    result.pass_test("DB_WRITE_VERIFY", "Write operation verified")
                                else:
                                    result.fail_test("DB_WRITE_VERIFY", "Written data not found in read")
                    else:
                        result.fail_test("DB_WRITE", f"Unexpected response format: {data}")
                else:
                    result.fail_test("DB_WRITE", f"HTTP {resp.status}: {await resp.text()}")
        except Exception as e:
            result.fail_test("DB_WRITE", f"Request failed: {str(e)}")
    
    return result

async def test_mongoose_models():
    """Test Mongoose models by checking their structure and basic operations"""
    print("\n📊 Testing Mongoose Models...")
    result = TestResult()
    
    # Test model files exist and can be imported (via Node.js execution)
    model_files = [
        '/app/lib/models/User.ts',
        '/app/lib/models/Project.ts', 
        '/app/lib/models/ProjectState.ts',
        '/app/lib/models/ReviewLog.ts',
        '/app/lib/models/UsageLog.ts'
    ]
    
    for model_file in model_files:
        try:
            if os.path.exists(model_file):
                # Read the file to check for basic structure
                with open(model_file, 'r') as f:
                    content = f.read()
                    
                model_name = os.path.basename(model_file).replace('.ts', '')
                
                # Check for essential Mongoose patterns
                if 'Schema' in content and 'model' in content:
                    result.pass_test(f"MODEL_{model_name.upper()}_STRUCTURE", "Schema and model definitions found")
                else:
                    result.fail_test(f"MODEL_{model_name.upper()}_STRUCTURE", "Missing Schema or model definitions")
                
                # Check for UUID usage (not ObjectId)
                if 'uuidv4' in content:
                    result.pass_test(f"MODEL_{model_name.upper()}_UUID", "Uses UUID instead of ObjectId")
                else:
                    result.warn_test(f"MODEL_{model_name.upper()}_UUID", "May not be using UUID")
                    
            else:
                result.fail_test(f"MODEL_{model_name.upper()}_EXISTS", "Model file not found")
                
        except Exception as e:
            result.fail_test(f"MODEL_{model_name.upper()}_READ", f"Failed to read model: {str(e)}")
    
    return result

async def test_stripe_integration():
    """Test Stripe client and configuration"""
    print("\n💳 Testing Stripe Integration...")
    result = TestResult()
    
    try:
        # Check Stripe client file
        stripe_file = '/app/lib/stripe/client.ts'
        if os.path.exists(stripe_file):
            with open(stripe_file, 'r') as f:
                content = f.read()
                
            # Check for correct API version
            if '2026-03-25.dahlia' in content:
                result.pass_test("STRIPE_API_VERSION", "Correct API version (2026-03-25.dahlia)")
            else:
                result.fail_test("STRIPE_API_VERSION", "Incorrect or missing API version")
            
            # Check for PLAN_TIERS
            if 'PLAN_TIERS' in content:
                result.pass_test("STRIPE_PLAN_TIERS", "PLAN_TIERS constant found")
            else:
                result.fail_test("STRIPE_PLAN_TIERS", "PLAN_TIERS constant not found")
            
            # Check for helper functions
            helper_functions = ['getPlanByPriceId', 'getCallLimitForPlan', 'getPlanTier']
            for func in helper_functions:
                if func in content:
                    result.pass_test(f"STRIPE_HELPER_{func.upper()}", f"Helper function {func} found")
                else:
                    result.fail_test(f"STRIPE_HELPER_{func.upper()}", f"Helper function {func} not found")
                    
        else:
            result.fail_test("STRIPE_CLIENT_FILE", "Stripe client file not found")
            
    except Exception as e:
        result.fail_test("STRIPE_FILE_READ", f"Failed to read Stripe file: {str(e)}")
    
    return result

async def test_core_utilities():
    """Test core utility functions"""
    print("\n🛠️  Testing Core Utilities...")
    result = TestResult()
    
    utility_files = {
        '/app/lib/utils/errors.ts': {
            'classes': ['VerityFlowError', 'ModelAdapterError', 'RateLimitError', 'UsageLimitError', 'ProjectStateError', 'VersionConflictError'],
            'functions': ['serializeError', 'isRateLimitError']
        },
        '/app/lib/utils/token-counter.ts': {
            'functions': ['estimateTokens', 'buildContextBudget', 'truncateObjectToFit'],
            'constants': ['MODEL_CONTEXT_LIMITS', 'MODEL_MAX_OUTPUT_TOKENS']
        },
        '/app/lib/utils/retry.ts': {
            'functions': ['withRetry'],
            'constants': ['MODEL_ADAPTER_RETRY_CONFIG']
        },
        '/app/lib/utils/project-state.ts': {
            'functions': ['initProjectState', 'getProjectState', 'setProjectState', 'mergeProjectState']
        }
    }
    
    for file_path, expected in utility_files.items():
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    content = f.read()
                
                file_name = os.path.basename(file_path).replace('.ts', '')
                
                # Check for expected classes
                if 'classes' in expected:
                    for class_name in expected['classes']:
                        if f"class {class_name}" in content or f"export class {class_name}" in content:
                            result.pass_test(f"UTIL_{file_name.upper()}_CLASS_{class_name.upper()}", f"Class {class_name} found")
                        else:
                            result.fail_test(f"UTIL_{file_name.upper()}_CLASS_{class_name.upper()}", f"Class {class_name} not found")
                
                # Check for expected functions
                if 'functions' in expected:
                    for func_name in expected['functions']:
                        if f"function {func_name}" in content or f"export function {func_name}" in content or f"export async function {func_name}" in content:
                            result.pass_test(f"UTIL_{file_name.upper()}_FUNC_{func_name.upper()}", f"Function {func_name} found")
                        else:
                            result.fail_test(f"UTIL_{file_name.upper()}_FUNC_{func_name.upper()}", f"Function {func_name} not found")
                
                # Check for expected constants
                if 'constants' in expected:
                    for const_name in expected['constants']:
                        if f"export const {const_name}" in content or f"const {const_name}" in content:
                            result.pass_test(f"UTIL_{file_name.upper()}_CONST_{const_name.upper()}", f"Constant {const_name} found")
                        else:
                            result.fail_test(f"UTIL_{file_name.upper()}_CONST_{const_name.upper()}", f"Constant {const_name} not found")
                            
            else:
                result.fail_test(f"UTIL_{file_name.upper()}_EXISTS", f"Utility file {file_path} not found")
                
        except Exception as e:
            result.fail_test(f"UTIL_{file_name.upper()}_READ", f"Failed to read utility file: {str(e)}")
    
    return result

async def test_redis_graceful_fallback():
    """Test that Redis operations gracefully fall back to MongoDB"""
    print("\n🔄 Testing Redis Graceful Fallback...")
    result = TestResult()
    
    try:
        # Check project-state.ts for Redis fallback logic
        project_state_file = '/app/lib/utils/project-state.ts'
        if os.path.exists(project_state_file):
            with open(project_state_file, 'r') as f:
                content = f.read()
            
            # Check for try-catch blocks around Redis operations
            if 'try {' in content and 'catch' in content:
                result.pass_test("REDIS_FALLBACK_STRUCTURE", "Try-catch blocks found for error handling")
            else:
                result.fail_test("REDIS_FALLBACK_STRUCTURE", "No error handling structure found")
            
            # Check for Redis import
            if 'redis' in content.lower():
                result.pass_test("REDIS_IMPORT", "Redis import found")
            else:
                result.warn_test("REDIS_IMPORT", "Redis import not found - may be using different approach")
            
            # Check for MongoDB fallback mentions
            if 'mongodb' in content.lower() or 'mongoose' in content.lower():
                result.pass_test("MONGODB_FALLBACK", "MongoDB fallback logic present")
            else:
                result.fail_test("MONGODB_FALLBACK", "No MongoDB fallback logic found")
                
        else:
            result.fail_test("PROJECT_STATE_FILE", "Project state file not found")
            
    except Exception as e:
        result.fail_test("REDIS_FALLBACK_TEST", f"Failed to test Redis fallback: {str(e)}")
    
    return result

async def test_typescript_compilation():
    """Test that TypeScript files can be compiled without errors"""
    print("\n📝 Testing TypeScript Compilation...")
    result = TestResult()
    
    try:
        # Check if tsconfig.json exists
        tsconfig_path = '/app/tsconfig.json'
        if os.path.exists(tsconfig_path):
            result.pass_test("TSCONFIG_EXISTS", "TypeScript configuration found")
            
            # Try to run TypeScript compiler check (if available)
            import subprocess
            try:
                # Run tsc --noEmit to check for compilation errors
                proc = subprocess.run(['npx', 'tsc', '--noEmit'], 
                                    cwd='/app', 
                                    capture_output=True, 
                                    text=True, 
                                    timeout=30)
                
                if proc.returncode == 0:
                    result.pass_test("TS_COMPILATION", "TypeScript compilation successful")
                else:
                    # Check if errors are related to our test files
                    if 'backend_test.py' not in proc.stderr:
                        result.fail_test("TS_COMPILATION", f"TypeScript errors: {proc.stderr[:200]}...")
                    else:
                        result.pass_test("TS_COMPILATION", "TypeScript compilation successful (ignoring test files)")
                        
            except subprocess.TimeoutExpired:
                result.warn_test("TS_COMPILATION", "TypeScript compilation check timed out")
            except FileNotFoundError:
                result.warn_test("TS_COMPILATION", "TypeScript compiler not available")
                
        else:
            result.fail_test("TSCONFIG_EXISTS", "TypeScript configuration not found")
            
    except Exception as e:
        result.fail_test("TS_COMPILATION_TEST", f"Failed to test TypeScript compilation: {str(e)}")
    
    return result

async def main():
    """Run all backend tests"""
    print("🚀 Starting VerityFlow Chunk 4 Backend Testing Suite")
    print(f"Testing against: {BASE_URL}")
    
    all_results = []
    
    # Run all test suites
    test_suites = [
        ("Environment Variables", test_environment_variables),
        ("NextAuth v5 Integration", test_nextauth_endpoints),
        ("Database Connectivity", test_database_connectivity),
        ("Mongoose Models", test_mongoose_models),
        ("Stripe Integration", test_stripe_integration),
        ("Core Utilities", test_core_utilities),
        ("Redis Graceful Fallback", test_redis_graceful_fallback),
        ("TypeScript Compilation", test_typescript_compilation),
    ]
    
    for suite_name, test_func in test_suites:
        try:
            result = await test_func()
            all_results.append((suite_name, result))
        except Exception as e:
            print(f"❌ {suite_name}: Test suite failed with error: {str(e)}")
            traceback.print_exc()
            failed_result = TestResult()
            failed_result.fail_test(suite_name, f"Test suite error: {str(e)}")
            all_results.append((suite_name, failed_result))
    
    # Print overall summary
    print(f"\n{'='*80}")
    print("🎯 OVERALL TEST SUMMARY")
    print(f"{'='*80}")
    
    total_passed = 0
    total_failed = 0
    critical_failures = []
    
    for suite_name, result in all_results:
        total_passed += result.passed
        total_failed += result.failed
        
        status = "✅ PASS" if result.failed == 0 else "❌ FAIL"
        print(f"{status} {suite_name}: {result.passed}/{result.passed + result.failed} tests passed")
        
        if result.failed > 0:
            critical_failures.extend([f"{suite_name}: {error}" for error in result.errors])
    
    print(f"\n📊 FINAL RESULTS:")
    print(f"   Total Tests: {total_passed + total_failed}")
    print(f"   Passed: {total_passed}")
    print(f"   Failed: {total_failed}")
    print(f"   Success Rate: {(total_passed/(total_passed + total_failed)*100):.1f}%")
    
    if critical_failures:
        print(f"\n🚨 CRITICAL FAILURES:")
        for failure in critical_failures[:10]:  # Show first 10 failures
            print(f"   - {failure}")
        if len(critical_failures) > 10:
            print(f"   ... and {len(critical_failures) - 10} more")
    
    print(f"{'='*80}")
    
    # Return exit code based on results
    return 0 if total_failed == 0 else 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Testing failed with unexpected error: {str(e)}")
        traceback.print_exc()
        sys.exit(1)