import { router, useFocusEffect, useNavigation, usePathname } from "expo-router";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Easing, Image, PixelRatio, Platform, StyleSheet, useWindowDimensions, View } from "react-native";

import { theme } from "../theme/orbital-theme";

type Destination = "/tasks" | "/checklists" | `/tasks/${number}` | `/tasks/photos/${number}` | `/checklists/form/${string}` | `/checklists/photos/${string}`;
type Preview = {
  uri: string;
  destination: Destination;
  disableNativeAnimation: () => void;
  phase: "loading" | "navigating" | "animating";
};
type ReturnAction = (destination: Destination, disableNativeAnimation: () => void) => void;
const BackTransitionContext = createContext<ReturnAction | null>(null);
type CaptureModule = typeof import("react-native-view-shot");

export function AndroidBackTransitionProvider({ children }: { children: ReactNode }) {
  const surface = useRef<View>(null);
  const captureModule = useRef<CaptureModule | null>(null);
  const captureUri = useRef<string | null>(null);
  const busy = useRef(false);
  const requestId = useRef(0);
  const mounted = useRef(true);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [progress] = useState(() => new Animated.Value(0));
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  const finish = useCallback(() => {
    if (watchdog.current) clearTimeout(watchdog.current);
    busy.current = false;
    requestId.current += 1;
    if (captureUri.current) {
      captureModule.current?.releaseCapture(captureUri.current);
      captureUri.current = null;
    }
    if (mounted.current) setPreview(null);
  }, []);

  useEffect(() => {
    mounted.current = true;
    // Load the capture module before the first gesture, rather than on release.
    if (Platform.OS === "android") {
      void import("react-native-view-shot").then((module) => {
        if (mounted.current) captureModule.current = module;
      }).catch(() => { /* Capture will retry or use the native fallback. */ });
    }
    return () => {
      mounted.current = false;
      if (watchdog.current) clearTimeout(watchdog.current);
      progress.stopAnimation();
      if (captureUri.current) captureModule.current?.releaseCapture(captureUri.current);
    };
  }, [progress]);

  const returnTo = useCallback<ReturnAction>(async (destination, disableNativeAnimation) => {
    if (Platform.OS !== "android") {
      router.dismissTo(destination);
      return;
    }
    if (busy.current) return;
    busy.current = true;
    const currentRequest = ++requestId.current;
    // A failed capture, image load, or interrupted navigation must not trap the user.
    watchdog.current = setTimeout(() => {
      finish();
      router.dismissTo(destination);
    }, 5000);
    try {
      const module = captureModule.current ?? await import("react-native-view-shot");
      captureModule.current = module;
      // A local JPEG avoids transferring a full-resolution PNG string over the bridge.
      const uri = await module.captureRef(surface, { format: "jpg", quality: 0.92, result: "tmpfile" });
      if (!mounted.current || currentRequest !== requestId.current) {
        module.releaseCapture(uri);
        return;
      }
      captureUri.current = uri;
      progress.setValue(0);
      setPreview({ uri, destination, disableNativeAnimation, phase: "loading" });
    } catch {
      if (!mounted.current || currentRequest !== requestId.current) return;
      finish();
      router.dismissTo(destination);
    }
  }, [finish, progress]);

  useEffect(() => {
    if (preview?.phase !== "navigating") return;
    preview.disableNativeAnimation();
    const frame = requestAnimationFrame(() => router.dismissTo(preview.destination));
    return () => cancelAnimationFrame(frame);
  }, [preview]);

  useEffect(() => {
    if (preview?.phase === "navigating" && pathname.replace(/\/$/, "") === preview.destination) {
      const frame = requestAnimationFrame(() => {
        setPreview((current) => current ? { ...current, phase: "animating" } : null);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [pathname, preview]);

  useEffect(() => {
    if (preview?.phase !== "animating") return;
    const animation = Animated.timing(progress, {
      toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    });
    // The pathname effect has already waited for the destination's next frame.
    animation.start(finish);
    return () => {
      animation.stop();
    };
  }, [finish, preview, progress]);

  const incoming = progress.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] });
  const outgoing = progress.interpolate({ inputRange: [0, 1], outputRange: [0, width] });

  return (
    <BackTransitionContext.Provider value={returnTo}>
      <View style={styles.root}>
        <Animated.View style={[styles.root, { transform: [{ translateX: preview && preview.phase !== "loading" ? incoming : 0 }] }]}>
          <View ref={surface} collapsable={false} style={styles.root} pointerEvents={preview ? "none" : "auto"}>
            {children}
          </View>
        </Animated.View>
        {preview && (
          <Animated.View style={[StyleSheet.absoluteFill, styles.snapshot, {
            // One physical pixel of overlap hides fractional-pixel texture seams.
            left: -1 / PixelRatio.get(),
            right: -1 / PixelRatio.get(),
            opacity: preview.phase === "loading" ? 0 : 1,
            transform: [{ translateX: outgoing }],
          }]}>
            <Image
              source={{ uri: preview.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="stretch"
              accessible={false}
              onLoad={() => setPreview((current) => current?.phase === "loading" ? { ...current, phase: "navigating" } : current)}
              onError={() => { finish(); router.dismissTo(preview.destination); }}
            />
          </Animated.View>
        )}
      </View>
    </BackTransitionContext.Provider>
  );
}

export function useSmoothReturn(destination: Destination, beforeReturn?: () => void) {
  const returnTo = useContext(BackTransitionContext);
  const navigation = useNavigation();
  const goBack = useCallback(() => {
    beforeReturn?.();
    if (!returnTo) { router.dismissTo(destination); return; }
    returnTo(destination, () => navigation.setOptions({ animation: "none" }));
  }, [beforeReturn, destination, navigation, returnTo]);

  useFocusEffect(useCallback(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { goBack(); return true; });
    return () => subscription.remove();
  }, [goBack]));

  return goBack;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, overflow: "hidden" },
  snapshot: { backgroundColor: theme.colors.background, zIndex: 1000, elevation: 0 },
});
