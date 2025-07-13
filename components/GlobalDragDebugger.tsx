import { useEffect } from 'react';

const GlobalDragDebugger: React.FC = () => {
  useEffect(() => {
    const logEvent = (event: DragEvent, type: string) => {
      console.log(`🌍 GLOBAL ${type.toUpperCase()} EVENT:`, {
        type,
        target: event.target,
        currentTarget: event.currentTarget,
        dataTransfer: event.dataTransfer,
        effectAllowed: event.dataTransfer?.effectAllowed,
        dropEffect: event.dataTransfer?.dropEffect,
        clientX: event.clientX,
        clientY: event.clientY,
        timeStamp: event.timeStamp
      });
    };

    const onGlobalDragStart = (e: DragEvent) => {
      logEvent(e, 'dragstart');
      console.log('🔴 GLOBAL DRAG START - Page should not go blank!');
    };

    const onGlobalDrag = (e: DragEvent) => {
      // Don't log every drag event as it's too noisy
      // logEvent(e, 'drag');
    };

    const onGlobalDragEnd = (e: DragEvent) => {
      logEvent(e, 'dragend');
      console.log('🟢 GLOBAL DRAG END - Page should be visible again');
    };

    const onGlobalDragOver = (e: DragEvent) => {
      // logEvent(e, 'dragover'); // Too noisy
    };

    const onGlobalDrop = (e: DragEvent) => {
      logEvent(e, 'drop');
    };

    const onGlobalDragEnter = (e: DragEvent) => {
      logEvent(e, 'dragenter');
    };

    const onGlobalDragLeave = (e: DragEvent) => {
      logEvent(e, 'dragleave');
    };

    // Add global listeners
    document.addEventListener('dragstart', onGlobalDragStart, true);
    document.addEventListener('drag', onGlobalDrag, true);
    document.addEventListener('dragend', onGlobalDragEnd, true);
    document.addEventListener('dragover', onGlobalDragOver, true);
    document.addEventListener('drop', onGlobalDrop, true);
    document.addEventListener('dragenter', onGlobalDragEnter, true);
    document.addEventListener('dragleave', onGlobalDragLeave, true);

    console.log('🌍 Global drag event listeners attached');

    return () => {
      document.removeEventListener('dragstart', onGlobalDragStart, true);
      document.removeEventListener('drag', onGlobalDrag, true);
      document.removeEventListener('dragend', onGlobalDragEnd, true);
      document.removeEventListener('dragover', onGlobalDragOver, true);
      document.removeEventListener('drop', onGlobalDrop, true);
      document.removeEventListener('dragenter', onGlobalDragEnter, true);
      document.removeEventListener('dragleave', onGlobalDragLeave, true);
      console.log('🌍 Global drag event listeners removed');
    };
  }, []);

  return null; // This component doesn't render anything
};

export default GlobalDragDebugger;
