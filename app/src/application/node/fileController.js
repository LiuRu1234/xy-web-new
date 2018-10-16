(function (factory) {
    if (!window.require || typeof(window.require) != 'function') return;

    module.exports = factory(
        window.require('chokidar'),
        window.require('os') 
    );

})(function (chokidar, os) {
    return {chokidar, os};
});


