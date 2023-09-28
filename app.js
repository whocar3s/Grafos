var Nodo = document.getElementById("Node");
var From = document.getElementById("From");
var To = document.getElementById("To");
var text = document.getElementById("Text");
var toggleCheckbox = document.getElementById('toggle');
var toggleContainer = document.querySelector('.toggleContainer');
var Content = document.getElementById("Red");

const btnDownload = document.getElementById("btnDownload");
const btnLoad = document.getElementById("btnLoad");
const btnMatrix = document.getElementById('btnMatrices');
const infoContainer = document.querySelector(".info-content-container");
const adyacenciaContent = document.getElementById("adyacencia-content");
const incidenciaContent = document.getElementById("incidencia-content");
const distMinimaContent = document.getElementById("dist-minima-content");
const routeMinimacaContent = document.getElementById("ruta-minima-content");
 
var infoVisibleStatus = false;

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
  var edgeId = event.edges[0];

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
  } else if(edgeId !== undefined) {
    const { value: nuevoPeso } = await Swal.fire({
      title: 'Editar Peso',
      input: 'range',
      icon: 'info',
      inputLabel: 'Ingresa el nuevo peso de la arista',
      inputValue: edges.get(edgeId).label,
      inputAttributes: {
        min: 0,
        max: 100,
        step: 1
      },
    });
    if(nuevoPeso !== undefined) edges.update({ id: edgeId, label: ''+nuevoPeso });
    
  }
});


function generarMatriz() {
  var data = {
    nodes: nodes.get({ returnType: "Object" }), // Obtener nodos como objeto
    edges: edges.get({ returnType: "Object" }), // Obtener bordes como objeto
  };
  var nodesGraph = Object.values(data.nodes);
  var edgesGraph = Object.values(data.edges);
  console.log('Matriz de Adyacencia:');
  console.log(formatMatrix(matrizAdyacencia(nodesGraph, edgesGraph)));
  console.log('Matriz de Incidencia:');
  console.log(formatMatrix(matrizIncidencia(nodesGraph, edgesGraph)));
  const startNode = nodesGraph[0].id;
  const { distances, path } = rutaminima(nodesGraph, edgesGraph, startNode);

  console.log("Distancias desde el nodo de inicio:", formatData(distances));
  console.log("Camino más corto desde el nodo de inicio:", formatDataSec(path));

  const rutaMaxima = encontrarRutaMaxima(nodesGraph, edgesGraph, startNode);
  console.log("Ruta máxima:", rutaMaxima);

  adyacenciaContent.textContent = formatMatrix(matrizAdyacencia(nodesGraph, edgesGraph));
  incidenciaContent.textContent = formatMatrix(matrizIncidencia(nodesGraph, edgesGraph));
  distMinimaContent.textContent = formatData(distances, nodesGraph[0].label);
  routeMinimacaContent.textContent = formatDataSec(path);
 
  infoContainer.style.display = infoVisibleStatus ? "none" : "block";
  infoVisibleStatus = !infoVisibleStatus;
}



function formatMatrix(matrix) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;

  let formattedMatrix = "   ";
  for (let col = 0; col < numCols; col++) {
    formattedMatrix += (col + 1).toString().padStart(3, " ") + " ";
  }
  formattedMatrix += "\n";

  for (let row = 0; row < numRows; row++) {
    formattedMatrix += (row + 1).toString().padStart(3, " ") + " ";
    for (let col = 0; col < numCols; col++) {
      formattedMatrix += matrix[row][col].toString().padStart(3, " ") + " ";
    }
    formattedMatrix += "\n";
  }
  return formattedMatrix;
}

function formatData(data, labelStart) {
  let formattedString = '';
  for (const key in data) {
    formattedString += `${labelStart} -> ${key} = ${data[key]}\n`;
  }
  return formattedString;
}

function formatDataSec(data) {
  let formattedString = '';
  for (const key in data) {
    formattedString += `${data[key].join(' -> ')}\n`;
  }
  return formattedString;
}


const matrizAdyacencia = (nodesArray, edgesArray) => {
  let matriz = []
  nodesArray.forEach(node => {
    let fila = []
    nodesArray.forEach(nodeTo => {
      let edge 
      if (edgesArray.find(edge => edge.arrows == "to")){
        edge = edgesArray.find(edge => edge.from == node.id && edge.to == nodeTo.id);
      }else{
        edge = edgesArray.find(edge =>(edge.from === node.id && edge.to === nodeTo.id) || (edge.from === nodeTo.id && edge.to === node.id))
      }
      
      if(edge) {
        fila.push(parseInt(edge.label));
      } else fila.push(0);
    });
    matriz.push(fila)
  });
  return matriz
};


const matrizIncidencia = (nodesArray, edgesArray) => {
  let matriz = []
  nodesArray.forEach(node => {
    let fila = []
    edgesArray.forEach(edge => {
      if (edgesArray.find(edge => edge.arrows === "to")){
        if(edge.from == node.id) {
          fila.push(1)
        } else if(edge.to == node.id) {
          fila.push(-1)
        } else {
          fila.push(0)
        }
      }else{
        if (edge.from == node.id || edge.to == node.id){
          fila.push(1)
        }else{
          fila.push(0)
        }
      }
    });
    matriz.push(fila)
  });
  return matriz

  
};

function rutaminima(nodesArray, edgesArray, startNode)
{
  const graph = {};

  // Inicializar el grafo con nodos vacíos
  nodesArray.forEach(node => {
    graph[node.id] = {};
  });

  // Llenar el grafo con las aristas y sus pesos
  edgesArray.forEach(edge => {
    graph[edge.from][edge.to] = parseInt(edge.label);
    graph[edge.to][edge.from] = parseInt(edge.label); // Para grafos no dirigidos
  });

  const distances = {};
  const visited = {};

  // Inicializar las distancias
  nodesArray.forEach(node => {
    distances[node.id] = Infinity;
  });
  distances[startNode] = 0;

  while (true) {
    let minNode = null;

    // Encontrar el nodo no visitado con la distancia mínima
    for (let node in distances) {
      if (!visited[node] && (minNode === null || distances[node] < distances[minNode])) {
        minNode = node;
      }
    }

    if (minNode === null) {
      break; // Todos los nodos han sido visitados
    }

    visited[minNode] = true;

    // Actualizar las distancias de los nodos vecinos
    for (let neighbor in graph[minNode]) {
      const distance = distances[minNode] + graph[minNode][neighbor];
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
      }
    }
  }

  // Reconstruir el objeto path basado en las distancias
  const path = {};
  nodesArray.forEach(node => {
    const nodeId = node.id;
    path[nodeId] = [];

    let currentNode = nodeId;
    while (currentNode !== startNode) {
      path[nodeId].unshift(currentNode);
      for (let neighbor in graph[currentNode]) {
        if (distances[neighbor] + graph[currentNode][neighbor] === distances[currentNode]) {
          currentNode = neighbor;
          break;
        }
      }
    }
    path[nodeId].unshift(startNode);
  });

  return { distances, path };
  
}

function encontrarRutaMaxima(nodesArray, edgesArray, startNode) {
  const graph = {};

  // Inicializar el grafo con nodos vacíos
  nodesArray.forEach(node => {
    graph[node.id] = {};
  });

  // Llenar el grafo con las aristas y sus pesos
  edgesArray.forEach(edge => {
    graph[edge.from][edge.to] = parseInt(edge.label);
  });

  const visited = new Set();
  const path = [];

  function dfs(node) {
    visited.add(node);
    path.push(node);

    let maxWeight = -Infinity;
    let nextNode = null;

    for (const neighbor in graph[node]) {
      if (!visited.has(neighbor)) {
        if (graph[node][neighbor] > maxWeight) {
          maxWeight = graph[node][neighbor];
          nextNode = neighbor;
        }
      }
    }

    if (nextNode !== null) {
      dfs(nextNode);
    }
  }

  dfs(startNode);

  return path;
}
