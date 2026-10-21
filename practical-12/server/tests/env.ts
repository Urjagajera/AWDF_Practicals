// Runs before each test file. A dedicated database means tests never touch real data;
// CI sets MONGO_URI to its MongoDB service container.
process.env.MONGO_URI ??= 'mongodb://127.0.0.1:27017/awdf_p12_test';
process.env.JWT_SECRET ??= 'test-only-secret';
process.env.NOTIFY_DELAY_MS ??= '0';
