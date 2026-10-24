import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";

import { taskCategories, TaskCategory } from "../constants/task-list";

type CategoryPagerProps<Category extends string> = {
  categories: readonly Category[];
  category: Category;
  onCategoryChange: (category: Category) => void;
  onSwipeStateChange: (swiping: boolean) => void;
  minHeight: number;
  children: (category: Category) => ReactNode;
};

export function TaskCategoryPager(props: Omit<CategoryPagerProps<TaskCategory>, "categories">) {
  return <CategoryPager categories={taskCategories} {...props} />;
}

export function CategoryPager<Category extends string>({ categories, category, onCategoryChange, onSwipeStateChange, minHeight, children }: CategoryPagerProps<Category>) {
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Partial<Record<Category, number>>>({});
  const [offset] = useState(() => new Animated.Value(0));
  const index = categories.indexOf(category);
  const activeIndex = useRef(index);
  useLayoutEffect(() => { activeIndex.current = index; }, [index]);
  const dragStart = useRef(0);

  const settle = useCallback((target: number) => {
    Animated.spring(offset, { toValue: -target * width, useNativeDriver: true, damping: 24, stiffness: 220, mass: 1 }).start();
  }, [offset, width]);

  useEffect(() => {
    settle(index);
    return () => offset.stopAnimation();
  }, [index, offset, settle]);

  // PanResponder stores these callbacks; it reads the gesture refs only on touch events.
  // eslint-disable-next-line react-hooks/refs
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      width > 0 && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderGrant: () => {
      dragStart.current = -activeIndex.current * width;
      offset.stopAnimation((value) => { dragStart.current = value; });
      onSwipeStateChange(true);
    },
    onPanResponderMove: (_, gesture) => {
      const position = dragStart.current + gesture.dx;
      const lastPage = -(categories.length - 1) * width;
      offset.setValue(position > 0 ? position * 0.2 : position < lastPage ? lastPage + (position - lastPage) * 0.2 : position);
    },
    onPanResponderRelease: (_, gesture) => {
      const horizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5;
      const commit = horizontal && (Math.abs(gesture.dx) > Math.min(45, width * 0.12) || (Math.abs(gesture.dx) > 14 && Math.abs(gesture.vx) > 0.35));
      const target = Math.max(0, Math.min(categories.length - 1, activeIndex.current + (commit ? gesture.dx < 0 ? 1 : -1 : 0)));
      onSwipeStateChange(false);
      onCategoryChange(categories[target]);
      settle(target);
    },
    onPanResponderTerminate: () => {
      onSwipeStateChange(false);
      settle(activeIndex.current);
    },
    onPanResponderTerminationRequest: () => false,
  }), [categories, offset, width, settle, onCategoryChange, onSwipeStateChange]);

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.viewport, { height: Math.max(minHeight, heights[category] ?? 0) }]}
      {...responder.panHandlers}
    >
      {width > 0 && (
        <Animated.View style={[styles.track, { width: width * categories.length, transform: [{ translateX: offset }] }]}>
          {categories.map((page) => (
            <View
              key={page}
              style={[styles.page, { width }]}
              pointerEvents={page === category ? "auto" : "none"}
              accessibilityElementsHidden={page !== category}
              importantForAccessibility={page === category ? "auto" : "no-hide-descendants"}
              onLayout={(event) => {
                const height = event.nativeEvent.layout.height;
                setHeights((previous) => previous[page] === height ? previous : { ...previous, [page]: height });
              }}
            >
              {children(page)}
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { overflow: "hidden", width: "100%" },
  track: { flexDirection: "row", alignItems: "flex-start" },
  page: { gap: 12 },
});
