;
window.adm_texture_status = window.adm_texture_status || false;
if (window.adm_geometry_status != true) {
    let formatVectorData = function(data, type, config) {
        var result = '';
        switch (type) {
        case 'f':
            for (let i = 0; i < data.length; i += 4) {
                const x = parseInt(data[i + 1]) + 1;
                const y = parseInt(data[i + 2]) + 1;
                const z = parseInt(data[i + 3]) + 1;

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

        if (current_node._shape) {
            name = current_node._name;
            indices = current_node._shape._vertexIndices;
            vertices = current_node._attributes.Vertex._elements;
            normals = current_node._attributes.Normal._elements;
            
            if (current_node._attributes.TexCoord0) {
                texcoords = current_node._attributes.TexCoord0._elements;
            } else if (current_node._attributes.TexCoord0) {
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

    if (true) {
        let models = [];
        let root_node = this;

        while (root_node._parents.length != 0) {
            root_node = root_node._parents[0];
        }
        
        recurseModelTree(root_node, models);

        for (let i = 0; i < models.length; i++) {
            window.adm_download(models[i].name + `(${i}).obj`, 
                formatVectorData(models[i].vertices, 'v') + 
                formatVectorData(models[i].texcoords, 'vt')+
                formatVectorData(models[i].normals, 'vn') +
                formatVectorData(models[i].indices, 'f', [!!models[i].texcoords, !!models[i].normals])
            );
            window.adm_geometry_status = true;
        }
    };
}
;