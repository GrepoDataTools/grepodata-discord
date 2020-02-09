module.exports = (client) => {
    Object.defineProperty(String.prototype, 'toProperCase', {
        value: function() {
            return this.replace(
                /([^\W_]+[^\s-]*) */g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        }
    });

    Object.defineProperty(Array.prototype, 'random', {
        value: function() {
            return this[Math.floor(Math.random() * this.length)];
        }
    });
};
