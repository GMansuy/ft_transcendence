module.exports = {
    ci: {
        collect: {
            url: 'http://localhost:8080/',
            settings: {
                chromeFlags: '--no-sandbox',
                emulatedFormFactor : 'desktop'
            },
        },
        upload: {
            target: 'temporary-public-storage',
      },
  }
};