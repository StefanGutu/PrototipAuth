console.log("Service Worker Loaded!");

self.addEventListener('push', (event) => {
    const data = event.data?.json();
    console.log('Push event received');

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: "./icons/social-media.png"
    });
});


  