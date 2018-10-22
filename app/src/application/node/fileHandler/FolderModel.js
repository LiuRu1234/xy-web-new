(function (factory) {
    if (!window.require || typeof(window.require) != 'function') return;

    module.exports = factory(
        window.require('chokidar'),
        window.require('electron').remote,
        window.require('os') 
    );

})(function (chokidar, dialog, os) {

});