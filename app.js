var Nodo = document.getElementById("Node");
var From = document.getElementById("From");
var To = document.getElementById("To");
var text = document.getElementById("Text");
var toggleCheckbox = document.getElementById('toggle');
var toggleContainer = document.querySelector('.toggleContainer');
var Content = document.getElementById("Red");

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
