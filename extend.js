function _extend(target, source) {
    for (let key of Object.keys(source)){
        if (target.hasOwnProperty(key) && typeof target[key] === "object") {
            extend(target[key], source[key])
        }
        else {
            target[key] = source[key];
        }
    }
    return target;
}

function extend(target, source) {
    if (source===null || source===undefined 
        || (Object.keys(source).length === 0 && source.constructor === Object)
        || typeof source === "number" || typeof source === "string"){
        return target;
    }
    else if (target===null || target===undefined) {
        return source;
    }
    else {
        return _extend(target, source);
    }
}

function $(className, type='div') {
    let node = document.createElement(type);
    node.className = className;
    return node;
}

console.log(extend({name: 'yym'}, 113));