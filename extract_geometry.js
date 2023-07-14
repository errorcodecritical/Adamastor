;
window.adm_texture_status = window.adm_texture_status || false;
if (window.adm_geometry_status != true) {
    window.adm_geometry_status = true;

    let formatVectorData = function(data, type, config) {
        var result = '';
        switch (type) {
        case 'f':
            for (let i = 0; i < data.length - 3; i++) {
                var x, y, z;
                if (i % 2 == 0) {
                    x = parseInt(data[i + 0]) + 1;
                    y = parseInt(data[i + 1]) + 1;
                    z = parseInt(data[i + 2]) + 1;
                } else {
                    z = parseInt(data[i + 0]) + 1;
                    y = parseInt(data[i + 1]) + 1;
                    x = parseInt(data[i + 2]) + 1;
                }

                result += `\n${type} ${x}/${config[0] ? x : ''}/${config[1] ? x : ''} ${y}/${config[0] ? y : ''}/${config[1] ? y : ''} ${z}/${config[0] ? z : ''}/${config[1] ? z : ''}`;
            }
            break;
        case 'vt':
            for (let i = 0; i < data.length; i += 2) {
                const x = data[i + 0];
                const y = data[i + 1];
                result += `\n${type} ${x} ${y}`;
            }
            break;
        default:
            for (let i = 0; i < data.length; i += 3) {
                const x = data[i + 0];
                const y = data[i + 1];
                const z = data[i + 2];
                result += `\n${type} ${x} ${y} ${z}`;
            }
        }

        return result;
    };

    let recurseModelTree = function(current_node, models) {
        for (let i = 0; i < current_node.children.length; i++) {
            recurseModelTree(current_node.children[i], models);
        }

        let register = false;

        let name = '';
        let vertices = [];
        let indices = [];
        let normals = [];
        let texcoords = [];

        if (current_node._attributes && current_node._attributes.Normal) {
            if (current_node._name) {
                name = current_node._name;
                window.adm_log("Found name");
            }
            if (current_node._primitives[0] && current_node._primitives[0].indices) {
                window.adm_log("Found indices");
                indices = current_node._primitives[0].indices._elements;
            }
            if (current_node._attributes.Vertex) {
                window.adm_log("Found vertices");
                vertices = current_node._attributes.Vertex._elements;
            }
            if (current_node._attributes.Normal) {
                window.adm_log("Found normals");
                normals = current_node._attributes.Normal._elements;
            }
            if (current_node._attributes.TexCoord0) {
                window.adm_log("Found texture0");
                texcoords = current_node._attributes.TexCoord0._elements;
            } else if (current_node._attributes.TexCoord1) {
                window.adm_log("Found texture1");
                texcoords = current_node._attributes.TexCoord1._elements;
            }

            register = true;
        }

        if (register) {
            models[models.length] = {
                name: name,
                vertices: vertices,
                indices: indices,
                normals: normals,
                texcoords: texcoords
            };
        }
    };
    
    let models = [];
    let root_node = this._rootScene;
    
    recurseModelTree(root_node, models);

    for (let i = 0; i < models.length; i++) {
        window.adm_download(models[i].name + `(${i}).obj`, 
            formatVectorData(models[i].vertices, 'v') + 
            formatVectorData(models[i].texcoords, 'vt')+
            formatVectorData(models[i].normals, 'vn') +
            formatVectorData(models[i].indices, 'f', [!!models[i].texcoords, !!models[i].normals])
        );
        window.adm_geometry_status = true;
    };
}
;