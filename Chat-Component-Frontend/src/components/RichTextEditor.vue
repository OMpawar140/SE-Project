// RichTextEditor.vue
<template>
  <div>
    <div ref="editor"></div>
  </div>
</template>

<script>
import { onMounted, ref, defineEmits } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default {
  setup(_, { emit }) {
    const editor = ref(null);
    let quillInstance = null;  // Store the Quill instance

    onMounted(() => {
      quillInstance = new Quill(editor.value, {
        theme: "snow",
      });

      quillInstance.on("text-change", () => {
        const content = quillInstance.root.innerHTML;
        emit("update-content", content);
      });
    });

    // Method to clear the editor
    const clearEditor = () => {
      if (quillInstance) {
        quillInstance.root.innerHTML = ""; // Clear the content
        emit("update-content", ""); // Also emit an empty string
      }
    };

    return { editor, clearEditor };
  },
  methods: {
      clearEditor() {
          this.clearEditor(); //Call the function when the button is clicked
      }
  }
};
</script>

<style>
.ql-container {
  min-height: 90px;
  background-color: white;
  color: black;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
}
.ql-toolbar{
  background-color: white;
  color: black;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
}
</style>