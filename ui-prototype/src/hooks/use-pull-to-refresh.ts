import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder } from "react-native";
import { Gesture } from "react-native-gesture-handler";

const REFRESH_DISTANCE = 64;

export function usePullToRefresh(onRefresh: () => void) {
  const [offset] = useState(() => new Animated.Value(0));
  const scrollTop = useRef(0);
  const distance = useRef(0);
  const busy = useRef(false);
  const nativeEligible = useRef(false);
  const nativeActive = useRef(false);
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

  // These callbacks read refs on gesture events, not while creating the responder.
  // eslint-disable-next-line react-hooks/refs
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      !busy.current && scrollTop.current <= 2 && gesture.dy > 10 &&
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

  const nativeScrollGesture = useMemo(() => Gesture.Native(), []);
  // Native recognition keeps receiving downward motion when Android's ScrollView
  // takes ownership of the touch sequence on a long list.
  /* eslint-disable react-hooks/refs -- Gesture callbacks run on touch events, never during registration. */
  const nativePullGesture = useMemo(() => Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY(10)
    .failOffsetX([-16, 16])
    .simultaneousWithExternalGesture(nativeScrollGesture)
    .onBegin(() => {
      nativeEligible.current = !busy.current && scrollTop.current <= 2;
    })
    .onStart(() => {
      if (!nativeEligible.current) return;
      nativeActive.current = true;
      offset.stopAnimation();
      distance.current = 0;
      setDragging(true);
    })
    .onUpdate((event) => {
      if (!nativeActive.current) return;
      distance.current = Math.min(110, Math.max(0, event.translationY * 0.5));
      offset.setValue(distance.current);
    })
    .onEnd(() => {
      if (!nativeActive.current) return;
      nativeActive.current = false;
      setDragging(false);
      if (distance.current >= REFRESH_DISTANCE) refresh(true);
      else settle(0);
    })
    .onFinalize(() => {
      if (!nativeActive.current) return;
      nativeActive.current = false;
      setDragging(false);
      if (!busy.current) settle(0);
    }), [nativeScrollGesture, offset, refresh, settle]);
  /* eslint-enable react-hooks/refs */

  return {
    offset, dragging, refreshing, refresh,
    panHandlers: responder.panHandlers,
    nativePullGesture, nativeScrollGesture,
    setScrollTop: (value: number) => { scrollTop.current = value; },
  };
}
