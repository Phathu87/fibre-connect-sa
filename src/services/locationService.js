export const locationService = {
  getCurrentPosition(timeout = 10_000) {
    if (!navigator.geolocation) return Promise.reject(new Error('Geolocation is not supported by this browser.'));
    return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => reject(new Error(error.code === 1 ? 'Location permission was denied.' : error.code === 3 ? 'Location request timed out.' : 'Current location is unavailable.')),
      { enableHighAccuracy: false, timeout, maximumAge: 60_000 },
    ));
  },
};
