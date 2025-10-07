const validateEnvironment = () => {
    const requiredEnvVars = [
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME'
    ];

    // Optional vars with defaults
    const optionalEnvVars = [
        { name: 'DB_PORT', default: '3306' },
        { name: 'PORT', default: '5000' }
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`- ${varName}`);
        });
        console.error('Please check your .env file and ensure all required variables are set.');
        process.exit(1);
    }

    console.log('Environment validation passed ✓');
};

module.exports = { validateEnvironment };
