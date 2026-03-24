export interface DSAProblemItem {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  link1: string;
  link2?: string;
  link3?: string;
}

export interface DSAPattern {
  pattern: string;
  problems: DSAProblemItem[];
}

export const DSA_SHEET: DSAPattern[] = [
  {
    pattern: "1. Two Pointers",
    problems: [
      { name: "Pair with Target Sum", difficulty: "Easy", link1: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/" },
      { name: "Rearrange 0 and 1", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1" },
      { name: "Remove Duplicates", difficulty: "Easy", link1: "https://leetcode.com/problems/remove-duplicates-from-sorted-list/", link2: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/", link3: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/" },
      { name: "Squaring a Sorted Array", difficulty: "Easy", link1: "https://leetcode.com/problems/squares-of-a-sorted-array/" },
      { name: "Triplet Sum to Zero", difficulty: "Medium", link1: "https://leetcode.com/problems/3sum/" },
      { name: "Triplet Sum Close to Target", difficulty: "Medium", link1: "https://leetcode.com/problems/3sum-closest/" },
      { name: "Triplets with Smaller Sum", difficulty: "Medium", link1: "https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1" },
      { name: "Subarrays with Product Less than Target", difficulty: "Medium", link1: "https://leetcode.com/problems/subarray-product-less-than-k/" },
      { name: "Dutch National Flag Problem", difficulty: "Medium", link1: "https://leetcode.com/problems/sort-colors/description/" },
      { name: "Quadruple Sum to Target", difficulty: "Medium", link1: "https://leetcode.com/problems/4sum/" },
      { name: "Comparing Strings with Backspaces", difficulty: "Medium", link1: "https://leetcode.com/problems/backspace-string-compare/" },
      { name: "Minimum Window Sort", difficulty: "Medium", link1: "https://leetcode.com/problems/shortest-unsorted-continuous-subarray/" }
    ]
  },
  {
    pattern: "2. Fast & Slow Pointers",
    problems: [
      { name: "LinkedList Cycle", difficulty: "Easy", link1: "https://leetcode.com/problems/linked-list-cycle/" },
      { name: "Start of LinkedList Cycle", difficulty: "Medium", link1: "https://leetcode.com/problems/linked-list-cycle-ii/" },
      { name: "Happy Number", difficulty: "Medium", link1: "https://leetcode.com/problems/happy-number/" },
      { name: "Find Duplicate Number", difficulty: "Medium", link1: "https://leetcode.com/problems/find-the-duplicate-number/description/" },
      { name: "Middle of the LinkedList", difficulty: "Easy", link1: "https://leetcode.com/problems/middle-of-the-linked-list/" },
      { name: "Palindrome LinkedList", difficulty: "Medium", link1: "https://leetcode.com/problems/palindrome-linked-list/" },
      { name: "Rearrange a LinkedList", difficulty: "Medium", link1: "https://leetcode.com/problems/reorder-list/" },
      { name: "Cycle in a Circular Array", difficulty: "Hard", link1: "https://leetcode.com/problems/circular-array-loop/" }
    ]
  },
  {
    pattern: "3. Sliding Window",
    problems: [
      { name: "Maximum Sum Subarray of Size K", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1" },
      { name: "Smallest Subarray with Given Sum", difficulty: "Easy", link1: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
      { name: "Longest Substring with K Distinct Characters", difficulty: "Medium", link1: "https://www.geeksforgeeks.org/problems/longest-k-unique-characters-substring0853/1" },
      { name: "Fruits into Baskets", difficulty: "Medium", link1: "https://leetcode.com/problems/fruit-into-baskets/" },
      { name: "No-repeat Substring", difficulty: "Hard", link1: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
      { name: "Longest Substring with Same Letters after Replacement", difficulty: "Hard", link1: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
      { name: "Longest Subarray with Ones after Replacement", difficulty: "Hard", link1: "https://leetcode.com/problems/max-consecutive-ones-iii/" },
      { name: "Minimum Window Substring", difficulty: "Hard", link1: "https://leetcode.com/problems/minimum-window-substring/description/" },
      { name: "Permutation in a String", difficulty: "Hard", link1: "https://leetcode.com/problems/permutation-in-string/" },
      { name: "String Anagrams", difficulty: "Hard", link1: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
      { name: "Words Concatenation", difficulty: "Hard", link1: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/" }
    ]
  },
  {
    pattern: "4. Kadane Pattern",
    problems: [
      { name: "Maximum Subarray Sum", difficulty: "Easy", link1: "https://leetcode.com/problems/maximum-subarray/" },
      { name: "Minimum Subarray Sum", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1" },
      { name: "Maximum Product Subarray", difficulty: "Medium", link1: "https://leetcode.com/problems/maximum-product-subarray/" },
      { name: "Maximum Subarray Sum with One Deletion", difficulty: "Medium", link1: "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/description/" },
      { name: "Maximum Absolute Sum of Any Subarray", difficulty: "Medium", link1: "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/" },
      { name: "Maximum Sum Circular Subarray", difficulty: "Medium", link1: "https://leetcode.com/problems/maximum-sum-circular-subarray/" }
    ]
  },
  {
    pattern: "5. Prefix Sum",
    problems: [
      { name: "Subarray Sum Equals K", difficulty: "Easy", link1: "https://leetcode.com/problems/subarray-sum-equals-k/description/" },
      { name: "Find Pivot Index", difficulty: "Easy", link1: "https://leetcode.com/problems/find-pivot-index/description/" },
      { name: "Subarray Sums Divisible By K", difficulty: "Medium", link1: "https://leetcode.com/problems/subarray-sums-divisible-by-k/description/" },
      { name: "Contiguous Array", difficulty: "Medium", link1: "https://leetcode.com/problems/contiguous-array/description/" },
      { name: "Shortest Subarray With Sum at Least K", difficulty: "Hard", link1: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/description/" },
      { name: "Count Range Sum", difficulty: "Hard", link1: "https://leetcode.com/problems/count-of-range-sum/description/" }
    ]
  },
  {
    pattern: "6. Merge Intervals",
    problems: [
      { name: "Merge Intervals", difficulty: "Medium", link1: "https://leetcode.com/problems/merge-intervals/description/" },
      { name: "Insert Interval", difficulty: "Medium", link1: "https://leetcode.com/problems/insert-interval/" },
      { name: "Intervals Intersection", difficulty: "Medium", link1: "https://leetcode.com/problems/interval-list-intersections/description/" },
      { name: "Overlapping Intervals", difficulty: "Medium", link1: "https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/" },
      { name: "Minimum Meeting Rooms", difficulty: "Hard", link1: "https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1" },
      { name: "Maximum CPU Load", difficulty: "Hard", link1: "https://www.geeksforgeeks.org/maximum-cpu-load-from-the-given-list-of-jobs/" },
      { name: "Employee Free Time", difficulty: "Hard", link1: "https://www.codertrain.co/employee-free-time" }
    ]
  },
  {
    pattern: "7. Cyclic Sort",
    problems: [
      { name: "Cyclic Sort", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/sort-an-array-which-contain-1-to-n-values-in-on-using-cycle-sort/" },
      { name: "Find the Missing Number", difficulty: "Easy", link1: "https://leetcode.com/problems/missing-number/" },
      { name: "Find all Missing Numbers", difficulty: "Easy", link1: "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/" },
      { name: "Find the Duplicate Number", difficulty: "Easy", link1: "https://leetcode.com/problems/find-the-duplicate-number/" },
      { name: "Find all Duplicate Numbers", difficulty: "Easy", link1: "https://leetcode.com/problems/find-all-duplicates-in-an-array/" },
      { name: "Find the Corrupt Pair", difficulty: "Easy", link1: "https://thecodingsimplified.com/find-currupt-pair/" },
      { name: "Find the Smallest Missing Positive Number", difficulty: "Medium", link1: "https://leetcode.com/problems/first-missing-positive/" },
      { name: "Find the First K Missing Positive Numbers", difficulty: "Hard", link1: "https://thecodingsimplified.com/find-the-first-k-missing-positive-number/" }
    ]
  },
  {
    pattern: "8. In-place Reversal of LinkedList",
    problems: [
      { name: "Reverse a LinkedList", difficulty: "Easy", link1: "https://leetcode.com/problems/reverse-linked-list/" },
      { name: "Reverse a Sub-list", difficulty: "Medium", link1: "https://leetcode.com/problems/reverse-linked-list-ii/" },
      { name: "Reverse List in Pairs", difficulty: "Medium", link1: "https://leetcode.com/problems/swap-nodes-in-pairs/description/" },
      { name: "Reverse every K-element Sub-list", difficulty: "Hard", link1: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
      { name: "Reverse nodes in Even Length Groups", difficulty: "Hard", link1: "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/description/" },
      { name: "Rotate a LinkedList", difficulty: "Medium", link1: "https://leetcode.com/problems/rotate-list/" }
    ]
  },
  {
    pattern: "9. Stack Pattern",
    problems: [
      { name: "Remove Adjacent Duplicates", difficulty: "Easy", link1: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/description/" },
      { name: "Balanced Parentheses", difficulty: "Easy", link1: "https://leetcode.com/problems/valid-parentheses/description/" },
      { name: "Next Greater Element", difficulty: "Easy", link1: "https://leetcode.com/problems/next-greater-element-ii/description/" },
      { name: "Daily Temperatures", difficulty: "Easy", link1: "https://leetcode.com/problems/daily-temperatures/" },
      { name: "Remove Nodes From Linked List", difficulty: "Easy", link1: "https://leetcode.com/problems/remove-nodes-from-linked-list/" },
      { name: "Remove All Adjacent Duplicates in String II", difficulty: "Medium", link1: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/" },
      { name: "Simplify Path", difficulty: "Medium", link1: "https://leetcode.com/problems/simplify-path/" },
      { name: "Remove K Digits", difficulty: "Hard", link1: "https://leetcode.com/problems/remove-k-digits/" }
    ]
  },
  {
    pattern: "10. Hash Maps",
    problems: [
      { name: "First Non-repeating Character", difficulty: "Easy", link1: "https://leetcode.com/problems/first-unique-character-in-a-string/" },
      { name: "Maximum Number of Balloons", difficulty: "Easy", link1: "https://leetcode.com/problems/maximum-number-of-balloons/" },
      { name: "Longest Palindrome", difficulty: "Easy", link1: "https://leetcode.com/problems/longest-palindrome/" },
      { name: "Ransom Note", difficulty: "Easy", link1: "https://leetcode.com/problems/ransom-note/" }
    ]
  },
  {
    pattern: "11. Binary Search",
    problems: [
      { name: "Binary Search Basic", difficulty: "Easy", link1: "https://leetcode.com/problems/binary-search/" },
      { name: "Upper Bound / Ceiling", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1" },
      { name: "First and Last Position", difficulty: "Medium", link1: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" },
      { name: "Count Number of Occurrences", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1" },
      { name: "Search in Infinite Sorted Array", difficulty: "Medium", link1: "https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/" },
      { name: "Peak Index in Mountain", difficulty: "Easy", link1: "https://leetcode.com/problems/peak-index-in-a-mountain-array/" },
      { name: "Find Peak in Mountain Range", difficulty: "Medium", link1: "https://leetcode.com/problems/find-peak-element/" },
      { name: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", link1: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
      { name: "Search in Rotated Sorted Array", difficulty: "Medium", link1: "https://leetcode.com/problems/search-in-rotated-sorted-array/description/" },
      { name: "Koko Eating Bananas", difficulty: "Medium", link1: "https://leetcode.com/problems/koko-eating-bananas/" },
      { name: "Min Days to Make M Bouquets", difficulty: "Medium", link1: "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/" },
      { name: "Aggressive Cows", difficulty: "Hard", link1: "https://www.geeksforgeeks.org/problems/aggressive-cows/1" },
      { name: "Book Allocation Problem", difficulty: "Hard", link1: "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1" },
      { name: "Capacity to Ship Packages in D Days", difficulty: "Medium", link1: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/" },
      { name: "Split Largest Array", difficulty: "Hard", link1: "https://leetcode.com/problems/split-array-largest-sum/description/" },
      { name: "Search 2D Matrix", difficulty: "Medium", link1: "https://leetcode.com/problems/search-a-2d-matrix/" },
      { name: "Search 2D Matrix Hard", difficulty: "Hard", link1: "https://leetcode.com/problems/search-a-2d-matrix-ii/description/" },
      { name: "Kth Smallest in Sorted Matrix", difficulty: "Medium", link1: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/" },
      { name: "Median of 2 Sorted Arrays", difficulty: "Hard", link1: "https://leetcode.com/problems/median-of-two-sorted-arrays/" }
    ]
  },
  {
    pattern: "12. Heap Pattern",
    problems: [
      { name: "Kth Smallest Element", difficulty: "Medium", link1: "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1" },
      { name: "Kth Largest Element", difficulty: "Medium", link1: "https://leetcode.com/problems/kth-largest-element-in-an-array/description/" },
      { name: "Top K Frequent Elements", difficulty: "Medium", link1: "https://leetcode.com/problems/top-k-frequent-elements/description/" },
      { name: "Top K Frequent Words", difficulty: "Medium", link1: "https://leetcode.com/problems/top-k-frequent-words/description/" },
      { name: "K Closest Points to Origin", difficulty: "Medium", link1: "https://leetcode.com/problems/k-closest-points-to-origin/description/" },
      { name: "Find K Closest Elements", difficulty: "Medium", link1: "https://leetcode.com/problems/find-k-closest-elements/description/" },
      { name: "Kth Weakest Row in Matrix", difficulty: "Easy", link1: "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/description/" },
      { name: "Merge K Sorted Arrays", difficulty: "Hard", link1: "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1" },
      { name: "Last Stone Weight", difficulty: "Easy", link1: "https://leetcode.com/problems/last-stone-weight/description/" },
      { name: "CPU Task Scheduler", difficulty: "Medium", link1: "https://leetcode.com/problems/task-scheduler/description/" },
      { name: "Reorganize String", difficulty: "Medium", link1: "https://leetcode.com/problems/reorganize-string/" },
      { name: "Min Number of Refueling Stops", difficulty: "Hard", link1: "https://leetcode.com/problems/minimum-number-of-refueling-stops/description/" },
      { name: "Find Median in Data Stream", difficulty: "Hard", link1: "https://leetcode.com/problems/find-median-from-data-stream/description/" },
      { name: "Sliding Window Median", difficulty: "Hard", link1: "https://leetcode.com/problems/sliding-window-median/description/" }
    ]
  },
  {
    pattern: "13. Recursion & Backtracking",
    problems: [
      { name: "Fibonacci", difficulty: "Easy", link1: "https://leetcode.com/problems/fibonacci-number/description/" },
      { name: "Check if String is Palindrome", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/palindrome-string0817/1" },
      { name: "Check if Array is Sorted", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1" },
      { name: "Sum of Digits of a Number", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/sum-of-digits1742/1" },
      { name: "Remove Occurrences of a Character", difficulty: "Easy", link1: "https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1" },
      { name: "Generate Parentheses", difficulty: "Medium", link1: "https://leetcode.com/problems/generate-parentheses/description/" },
      { name: "Letter Combinations of Phone Number", difficulty: "Medium", link1: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/" },
      { name: "Permutations", difficulty: "Medium", link1: "https://leetcode.com/problems/permutations/description/" },
      { name: "Combination Sum", difficulty: "Medium", link1: "https://leetcode.com/problems/combination-sum/description/" },
      { name: "Palindrome Partitioning", difficulty: "Medium", link1: "https://leetcode.com/problems/palindrome-partitioning/description/" }
    ]
  },
  {
    pattern: "14. Tree Pattern",
    problems: [
      { name: "Binary Tree Inorder Traversal", difficulty: "Easy", link1: "https://leetcode.com/problems/binary-tree-inorder-traversal/description/" },
      { name: "Binary Tree Preorder Traversal", difficulty: "Easy", link1: "https://leetcode.com/problems/binary-tree-preorder-traversal/description/" },
      { name: "Binary Tree Postorder Traversal", difficulty: "Easy", link1: "https://leetcode.com/problems/binary-tree-postorder-traversal/description/" },
      { name: "Level Order Traversal", difficulty: "Medium", link1: "https://leetcode.com/problems/binary-tree-level-order-traversal/description/" },
      { name: "ZigZag Level Order Traversal", difficulty: "Medium", link1: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/description/" },
      { name: "Invert Binary Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/invert-binary-tree/description/" },
      { name: "Symmetric Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/symmetric-tree/description/" },
      { name: "Same Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/same-tree/description/" },
      { name: "Subtree of Another Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/subtree-of-another-tree/description/" },
      { name: "LCA of Binary Tree", difficulty: "Medium", link1: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/" },
      { name: "Search in Binary Search Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/search-in-a-binary-search-tree/" },
      { name: "LCA of BST", difficulty: "Medium", link1: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/description/" },
      { name: "Kth Smallest in BST", difficulty: "Medium", link1: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/" },
      { name: "Minimum Depth of Binary Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/minimum-depth-of-binary-tree/description/" },
      { name: "Maximum Depth of Binary Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/maximum-depth-of-binary-tree/description/" },
      { name: "Balanced Binary Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/balanced-binary-tree/description/" },
      { name: "Diameter of Binary Tree", difficulty: "Easy", link1: "https://leetcode.com/problems/diameter-of-binary-tree/description/" },
      { name: "Validate BST", difficulty: "Medium", link1: "https://leetcode.com/problems/validate-binary-search-tree/description/" },
      { name: "Recover BST", difficulty: "Medium", link1: "https://leetcode.com/problems/recover-binary-search-tree/description/" },
      { name: "Path Sum", difficulty: "Easy", link1: "https://leetcode.com/problems/path-sum/description/" },
      { name: "Path Sum II", difficulty: "Medium", link1: "https://leetcode.com/problems/path-sum-ii/" },
      { name: "Sum of Root to Leaf", difficulty: "Medium", link1: "https://leetcode.com/problems/sum-root-to-leaf-numbers/description/" },
      { name: "Maximum Path Sum", difficulty: "Hard", link1: "https://leetcode.com/problems/binary-tree-maximum-path-sum/description/" },
      { name: "Construct Tree from Preorder and Inorder", difficulty: "Medium", link1: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/" },
      { name: "Sorted Array to BST", difficulty: "Easy", link1: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/description/" },
      { name: "Serialize and Deserialize Binary Tree", difficulty: "Hard", link1: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/description/" }
    ]
  }
];

export const TOTAL_PROBLEMS = DSA_SHEET.reduce((sum, p) => sum + p.problems.length, 0);
