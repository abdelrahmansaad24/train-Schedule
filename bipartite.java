import java.util.*;

class Main {

    public static String isBipartite(int n, List<int[]> edges) {
        try {
            // Adjacency list representation of the graph
            List<List<Integer>> graph = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                graph.add(new ArrayList<>());
            }
            for (int[] edge : edges) {
                graph.get(edge[0]).add(edge[1]);
                graph.get(edge[1]).add(edge[0]);
            }
            // Array to store colors of nodes (-1: unvisited, 0: color 1, 1: color 2)
            int[] colors = new int[n];
            Arrays.fill(colors, -1);

            // Check each component of the graph
            for (int i = 0; i < n; i++) {
                if (colors[i] == -1) { // Node not yet visited
                    if (!bfsCheck(graph, i, colors)) {
                        return "NO"; // Not bipartite
                    }
                }
            }
            return "YES"; // Bipartite
        }catch (Exception e){
            System.out.println("Wrong Input"); // Edge point to null
            return "NO";
        }
    }

    private static boolean bfsCheck(List<List<Integer>> graph, int start, int[] colors) {
        Queue<Integer> queue = new LinkedList<>();
        queue.offer(start);
        colors[start] = 0; // Start coloring with color 0

        while (!queue.isEmpty()) {
            int node = queue.poll();

            for (int neighbor : graph.get(node)) {
                if (colors[neighbor] == -1) {
                    // Assign opposite color to the neighbor
                    colors[neighbor] = 1 - colors[node];
                    queue.offer(neighbor);
                } else if (colors[neighbor] == colors[node]) {
                    // Same color on both sides means it's not bipartite
                    return false;
                }
            }
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter the number of edges: ");
        int n = sc.nextInt();
        List<int[]> edges = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            int from = sc.nextInt();
            int to = sc.nextInt();
            edges.add(new int[]{from, to});
        }
        String result = isBipartite(n, edges);
        System.out.println("Is the graph bipartite? " + result);
    }
}