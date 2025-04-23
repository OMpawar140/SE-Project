<template>
    <div class="mb-3">
      <label class="form-label">{{ label }}</label>
      <input 
        :type="type" 
        class="form-control" 
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.value)" 
        required
      >
    </div>
  </template>
  
  <script>
  export default {
    props: {
      label: String,
      type: String,
      modelValue: String
    },
    emits: ['update:modelValue']
  };
  </script>
  