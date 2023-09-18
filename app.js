var Nodo = document.getElementById("Node");
var From = document.getElementById("From");
var To = document.getElementById("To");
var text = document.getElementById("Text");
var toggleCheckbox = document.getElementById('toggle');
var toggleContainer = document.querySelector('.toggleContainer');
var Content = document.getElementById("Red");

const btnDownload = document.getElementById("btnDownload");
const btnLoad = document.getElementById("btnLoad");

var nodes = new vis.DataSet();
var edges = new vis.DataSet();

var data = {
  nodes: nodes,
  edges: edges,
};

var options = {
  physics: false,
  nodes: {
    shape: "dot",
    size: 20,
    color: {
      border: "#e1a66f",
      background: "#0c484b",
      highlight: "#e1a66f",
    },
    font: { size: 30, color: "#e1a66f" },
    borderWidth: 2,
    shadow: true,
  },
  edges: {
    width: 2,
    shadow: true,
  },
};

const showError = msj => {
  Swal.fire({
    icon: "error",
    text: msj,
    title: "Error",
  });
}

var graph = new vis.Network(Content, data, options);

function Clear() {
  Nodo.value = "";
  From.value = "";
  To.value = "";
  text.value = "";
}

function addNode() {
  if (graph.clustering.findNode(Nodo.value) == Nodo.value && Nodo.value != "") return showError("Ese nodo ya existe.");    

  if (Nodo.value == "") return showError("Debe llenar el espacio de nodo.");

  nodes.add({
    id: Nodo.value,
    label: Nodo.value,
  });
}

function addEdge() {
  console.log(From.value + To.value);
  if (From.value == "" || To.value == "") return showError("Por favor rellene los campos necesarios.");
  

  edges.add({
    id: From.value + To.value,
    from: From.value,
    to: To.value,
    label: text.value,
    arrows: toggleCheckbox.checked ? '...' : 'to' 
  });
}

function Delete() {
  if (Nodo.value == "") return showError("Por favor rellene los campos necesarios.");
  nodes.remove(Nodo.value);
}

function disconnect() {
  if (From.value == "" && To.value == "") return showError("Debe rellenar desde donde se desconecta.")
  edges.remove({ id: From.value + To.value });
}


function downloadGraph() {
  var dataToSave = {
    nodes: nodes.get({ returnType: "Object" }), // Obtener nodos como objeto
    edges: edges.get({ returnType: "Object" }), // Obtener bordes como objeto
  };
  const grafoJSON = JSON.stringify(dataToSave);
  
  // Crea un enlace de descarga invisible
  const enlaceDescarga = document.createElement('a');
  enlaceDescarga.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(grafoJSON);
  enlaceDescarga.download = 'grafo.json';
  
  // Simula un clic en el enlace para abrir la ventana de descarga
  enlaceDescarga.style.display = 'none';
  document.body.appendChild(enlaceDescarga);
  enlaceDescarga.click();
  
  // Limpia el enlace después de que se complete la descarga
  document.body.removeChild(enlaceDescarga);
}

function loadGraph() {
  const inputArchivo = document.createElement('input');
  inputArchivo.type = 'file';

  inputArchivo.addEventListener('change', (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (eventoCarga) => {
      const grafoJSON = eventoCarga.target.result;
      const grafoData = JSON.parse(grafoJSON);

      var nodesArray = Object.values(grafoData.nodes);
      nodes.clear();
      nodesArray.forEach(function (node) {
        nodes.add(node);
      });
      
      var edgesArray = Object.values(grafoData.edges);
      edges.clear();
      edgesArray.forEach(function (edge) {
        edges.add(edge);
      });


    };
    lector.readAsText(archivo);
  });

  inputArchivo.click();
}



graph.on("doubleClick", async event => {
  var nodeId = event.nodes[0]; 
  
  if (nodeId !== undefined) {
    const { value: nuevoNombre } = await Swal.fire({
      title: 'Editar Nodo',
      input: 'text',
      inputLabel: 'Ingresa el nuevo nombre del nodo',
      inputValue: nodes.get(nodeId).label,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor escribe un nombre valido!'
        }
      }
    })
    
    if (nuevoNombre !== null && nuevoNombre != '' && nuevoNombre != undefined) {
      console.log(nuevoNombre)
      nodes.update({ id: nodeId, label: nuevoNombre });
    }
  }
});
