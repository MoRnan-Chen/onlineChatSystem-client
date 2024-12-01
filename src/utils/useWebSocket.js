// useWebSocket.js
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
//定义 useWebSocket 用于复用
export default function useWebSocket(url, onMessage) {
  const socket = ref(null);

  const initWebSocket = () => {
    socket.value = new WebSocket(url);

    socket.value.onopen = () => {
      console.log('WebSocket 连接已建立。');
    };

    socket.value.onmessage = onMessage;

    socket.value.onerror = (error) => {
      console.error('WebSocket 发生错误：', error);
    };

    socket.value.onclose = (event) => {
      console.log('WebSocket 连接已关闭：', event.reason);
      // 如有需要，可在此实现重连逻辑
    };
  };
  
  onMounted(() => {
    initWebSocket();
  });

  onBeforeUnmount(() => {
    if (socket.value) {
      socket.value.close();
    }
  });

  const sendMessage = (message) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(message);
      return true;
    } else {
      console.error('WebSocket 未连接或已关闭。');
      ElMessage.error("发送失败");
      return false;
    }
  };

  return {
    sendMessage,
  };
}
