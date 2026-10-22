import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder } from "react-native";

const REFRESH_DISTANCE = 64;

export function usePullToRefresh(onRefresh: () => void) {
  const offset = useRef(new Animated.Value(0)).current;
  const scrollTop = useRef(0);
  const distance = useRef(0);
  const busy = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
    offset.stopAnimation();
  }, [offset]);

  const settle = useCallback((toValue: number) => {
    Animated.spring(offset, { toValue, useNativeDriver: true, bounciness: 0 }).start();
  }, [offset]);

  const refresh = useCallback((fromPull = false) => {
    if (busy.current) return;
    busy.current = true;
    setRefreshing(true);
    if (fromPull) settle(REFRESH_DISTANCE);
    timeout.current = setTimeout(() => {
      busy.current = false;
      setRefreshing(false);
      settle(0);
      onRefresh();
    }, 1000);
  }, [onRefresh, settle]);

  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      !busy.current && scrollTop.current <= 0 && gesture.dy > 10 &&
      gesture.dy > Math.abs(gesture.dx) * 1.5,
    onPanResponderGrant: () => {
      offset.stopAnimation();
      distance.current = 0;
      setDragging(true);
    },
    onPanResponderMove: (_, gesture) => {
      distance.current = Math.min(110, Math.max(0, gesture.dy * 0.5));
      offset.setValue(distance.current);
    },
    onPanResponderRelease: () => {
      setDragging(false);
      if (distance.current >= REFRESH_DISTANCE) refresh(true);
      else settle(0);
    },
    onPanResponderTerminate: () => {
      setDragging(false);
      settle(0);
    },
  }), [offset, refresh, settle]);

  return {
    offset, dragging, refreshing, refresh,
    panHandlers: responder.panHandlers,
    setScrollTop: (value: number) => { scrollTop.current = value; },
  };
}
