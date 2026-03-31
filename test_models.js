
const { User } = require('./lib/models/User.ts');
const { CreditTransaction } = require('./lib/models/CreditTransaction.ts');

console.log("Testing User model import...");
if (User) {
    console.log("✅ User model imported successfully");
    console.log("User model methods:", Object.getOwnPropertyNames(User.prototype));
} else {
    console.log("❌ User model import failed");
    process.exit(1);
}

console.log("Testing CreditTransaction model import...");
if (CreditTransaction) {
    console.log("✅ CreditTransaction model imported successfully");
    console.log("CreditTransaction model methods:", Object.getOwnPropertyNames(CreditTransaction.prototype));
} else {
    console.log("❌ CreditTransaction model import failed");
    process.exit(1);
}

console.log("✅ All model imports successful");
