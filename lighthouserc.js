module.exports = {
    ci: {
        collect: {
            url: "http://localhost:8080/",
            settings: {
                emulatedFormFactor : "desktop"
            },
        },
        upload: {
            target: 'temporary-public-storage',
      },
  }
};