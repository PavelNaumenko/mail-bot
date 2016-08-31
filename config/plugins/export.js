exports.handlers = {
    beforeParse: function(e) {
        e.source = e.source.replace(/export\s+(\w+)\s+from/g, '// export');
    }
}