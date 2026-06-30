from collections import deque, defaultdict
from typing import Any, List, Dict, Set, Optional, Tuple

class Node:
    """
    A dynamic node struct that allows adding/removing arbitrary data fields.
    Usage: node = Node("A"); node.weight = 10; node.color = "red"
    """
    def __init__(self, identifier: Any):
        self.id = identifier  # Unique identifier for the node
        # All other attributes are dynamic
    
    def add_field(self, name: str, value: Any) -> None:
        """Dynamically adds a data field to the node."""
        setattr(self, name, value)
    
    def remove_field(self, name: str) -> bool:
        """Removes a data field if it exists."""
        if hasattr(self, name):
            delattr(self, name)
            return True
        return False
    
    def get_fields(self) -> Dict[str, Any]:
        """Returns all dynamic data fields as a dictionary (excluding 'id')."""
        return {k: v for k, v in self.__dict__.items() if k != 'id'}
    
    def __hash__(self):
        # Nodes are hashed by their ID so they can be used in sets/dicts
        return hash(self.id)
    
    def __eq__(self, other):
        if isinstance(other, Node):
            return self.id == other.id
        return False
    
    def __repr__(self):
        fields = ", ".join(f"{k}={v}" for k, v in self.get_fields().items())
        return f"Node({self.id}, {fields})"

class DirectedGraph:
    """
    Directed Graph using Node objects as vertices.
    Supports dynamic data fields on nodes.
    """
    
    def __init__(self):
        # Adjacency list: {Node: [(Node, weight), ...]}
        self.adj_list: Dict[Node, List[Tuple[Node, float]]] = defaultdict(list)
        self.nodes_map: Dict[Any, Node] = {}  # Map ID -> Node object for quick lookup

    # --- Node Management ---

    def add_node(self, identifier: Any, **kwargs) -> Node:
        """
        Creates a new Node with the given identifier and optional initial fields.
        Returns the Node object.
        """
        if identifier in self.nodes_map:
            node = self.nodes_map[identifier]
            # Update fields if provided
            for k, v in kwargs.items():
                setattr(node, k, v)
            return node
        
        node = Node(identifier)
        self.nodes_map[identifier] = node
        # Ensure the node exists in adj_list even if it has no edges yet
        if node not in self.adj_list:
            self.adj_list[node] = []
        
        # Add initial dynamic fields
        for k, v in kwargs.items():
            setattr(node, k, v)
            
        return node

    def get_node(self, identifier: Any) -> Optional[Node]:
        """Retrieves a Node object by its identifier."""
        return self.nodes_map.get(identifier)

    def remove_node(self, identifier: Any) -> bool:
        """Removes a node and all associated edges."""
        if identifier not in self.nodes_map:
            return False
        
        node = self.nodes_map[identifier]
        
        # Remove incoming edges (scan all nodes)
        for u in list(self.adj_list.keys()):
            self.adj_list[u] = [(v, w) for v, w in self.adj_list[u] if v != node]
        
        # Remove outgoing edges and the node itself
        if node in self.adj_list:
            del self.adj_list[node]
        del self.nodes_map[identifier]
        return True

    # --- Edge Management ---

    def add_edge(self, u_id: Any, v_id: Any, weight: float = 1.0) -> None:
        """Adds a directed edge between two nodes (identified by their IDs)."""
        if u_id not in self.nodes_map:
            self.add_node(u_id)
        if v_id not in self.nodes_map:
            self.add_node(v_id)
            
        u_node = self.nodes_map[u_id]
        v_node = self.nodes_map[v_id]
        
        # Check if edge already exists to avoid duplicates
        for existing_v, _ in self.adj_list[u_node]:
            if existing_v == v_node:
                return # Edge exists
        
        self.adj_list[u_node].append((v_node, weight))

    def remove_edge(self, u_id: Any, v_id: Any) -> bool:
        """Removes the directed edge from u to v."""
        if u_id not in self.nodes_map or v_id not in self.nodes_map:
            return False
            
        u_node = self.nodes_map[u_id]
        v_node = self.nodes_map[v_id]
        
        original_len = len(self.adj_list[u_node])
        self.adj_list[u_node] = [(nbr, w) for nbr, w in self.adj_list[u_node] if nbr != v_node]
        return len(self.adj_list[u_node]) < original_len

    # --- Traversal & Analysis (Updated to work with Node objects) ---

    def bfs(self, start_id: Any) -> List[Node]:
        """BFS returning list of Node objects."""
        if start_id not in self.nodes_map:
            return []
        
        start_node = self.nodes_map[start_id]
        visited = set([start_node])
        queue = deque([start_node])
        order = []

        while queue:
            node = queue.popleft()
            order.append(node)
            for neighbor, _ in self.adj_list[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return order

    def dfs(self, start_id: Any) -> List[Node]:
        """DFS returning list of Node objects."""
        if start_id not in self.nodes_map:
            return []
        
        start_node = self.nodes_map[start_id]
        visited = set()
        order = []

        def _dfs(node):
            visited.add(node)
            order.append(node)
            for neighbor, _ in self.adj_list[node]:
                if neighbor not in visited:
                    _dfs(neighbor)
        
        _dfs(start_node)
        return order

    def has_cycle(self) -> bool:
        """Detects cycles using Node objects."""
        visited = set()
        rec_stack = set()

        def _check_cycle(node):
            visited.add(node)
            rec_stack.add(node)
            for neighbor, _ in self.adj_list.get(node, []):
                if neighbor not in visited:
                    if _check_cycle(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            rec_stack.remove(node)
            return False

        for node in self.nodes_map.values():
            if node not in visited:
                if _check_cycle(node):
                    return True
        return False

    def topological_sort(self) -> Optional[List[Node]]:
        """Returns topological order of Node objects or None if cyclic."""
        if self.has_cycle():
            return None

        in_degree = {node: 0 for node in self.nodes_map.values()}
        for u in self.adj_list:
            for v, _ in self.adj_list[u]:
                in_degree[v] += 1

        queue = deque([node for node, deg in in_degree.items() if deg == 0])
        topo_order = []

        while queue:
            u = queue.popleft()
            topo_order.append(u)
            for v, _ in self.adj_list[u]:
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)

        return topo_order if len(topo_order) == len(self.nodes_map) else None

    def shortest_path_dijkstra(self, start_id: Any, end_id: Any) -> Tuple[List[Node], float]:
        """Finds shortest path between node IDs."""
        if start_id not in self.nodes_map or end_id not in self.nodes_map:
            return [], float('inf')
        
        start_node = self.nodes_map[start_id]
        end_node = self.nodes_map[end_id]
        
        distances = {node: float('inf') for node in self.nodes_map.values()}
        distances[start_node] = 0
        predecessors = {node: None for node in self.nodes_map.values()}
        unvisited = set(self.nodes_map.values())

        while unvisited:
            current = min(unvisited, key=lambda node: distances[node])
            if distances[current] == float('inf'):
                break
            if current == end_node:
                break

            unvisited.remove(current)

            for neighbor, weight in self.adj_list[current]:
                if neighbor in unvisited:
                    alt = distances[current] + weight
                    if alt < distances[neighbor]:
                        distances[neighbor] = alt
                        predecessors[neighbor] = current

        path = []
        curr = end_node
        while curr is not None:
            path.append(curr)
            curr = predecessors[curr]
        path.reverse()

        return (path, distances[end_node]) if distances[end_node] != float('inf') else ([], float('inf'))

    def __str__(self) -> str:
        result = []
        for node in sorted(self.nodes_map.values(), key=lambda n: str(n.id)):
            neighbors = [f"{n.id}" for n, _ in self.adj_list[node]]
            fields = ", ".join(f"{k}={v}" for k, v in node.get_fields().items())
            field_str = f" [{fields}]" if fields else ""
            result.append(f"{node.id}{field_str} -> {neighbors}")
        return "\n".join(result)

# --- Example Usage ---
if __name__ == "__main__":
    g = DirectedGraph()
    
    # Add nodes with initial dynamic fields (like struct initialization)
    node_a = g.add_node("A", type="start", priority=1)
    node_b = g.add_node("B", type="process", priority=2)
    node_c = g.add_node("C", type="end", priority=3)
    
    # Dynamically add/remove fields later
    node_a.add_field("color", "red")
    node_b.add_field("color", "blue")
    node_b.remove_field("priority") # Remove a field
    
    # Add edges
    g.add_edge("A", "B", 1.0)
    g.add_edge("B", "C", 2.0)
    g.add_edge("A", "C", 5.0)
    
    print("Graph Structure:")
    print(g)
    
    print("\nBFS from A:")
    for node in g.bfs("A"):
        print(f"  Visited: {node.id}, Data: {node.get_fields()}")
        
    print("\nShortest Path A->C:")
    path, dist = g.shortest_path_dijkstra("A", "C")
    print(f"  Path: {[n.id for n in path]}, Distance: {dist}")   