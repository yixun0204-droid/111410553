def bubble_sort(arr):
    """氣泡排序（Bubble Sort）"""
    n = len(arr)
    for i in range(n):
        swapped = False  # 標記該輪是否有交換
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]  # 交換相鄰元素
                swapped = True
        if not swapped:  # 若無交換，表示已排序完成
            break
    return arr


if __name__ == "__main__":
    test = [64, 34, 25, 12, 22, 11, 90]
    print(f"排序前: {test}")
    bubble_sort(test)
    print(f"排序後: {test}")
