exports.handlers = {
    beforeParse: function(e) {
        e.source = e.source.replace(/@CSSModules/g, '// @CSSModules');
    }
}