module.exports = {
    apps: [
        {
            name: 'pikr-frontend',
            script: 'npm',
            args: 'start',
            cwd: './',
            env: {
                NODE_ENV: 'production',
                PORT: 2008
            }
        }
    ]
};
