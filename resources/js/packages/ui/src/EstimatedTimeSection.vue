<script setup lang="ts">
import DurationInput from '@/packages/ui/src/Input/DurationInput.vue';
import { ClockIcon } from '@heroicons/vue/20/solid';
import InputLabel from '@/packages/ui/src/Input/InputLabel.vue';

const model = defineModel<number | null>();
const emit = defineEmits(['submit']);
</script>

<template>
    <div class="pt-6">
        <div class="flex items-center mb-2 space-x-1">
            <ClockIcon class="w-4 text-text-quaternary"></ClockIcon>
            <InputLabel for="billable" :value="$t('dashboard.Time Estimated')" />
        </div>
        <DurationInput
            v-model="model"
            class="max-w-[150px]"
            @submit="emit('submit')"></DurationInput>
    </div>
</template>

<style scoped></style>
