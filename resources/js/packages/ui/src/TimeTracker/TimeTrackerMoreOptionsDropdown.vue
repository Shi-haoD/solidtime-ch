<script setup lang="ts">
import { PlusIcon, XMarkIcon } from '@heroicons/vue/20/solid';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

const props = defineProps<{
    hasActiveTimer: boolean;
}>();

const emit = defineEmits<{
    manualEntry: [];
    discard: [];
}>();
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <button
                class="transition-opacity rounded-full focus-visible:outline-none focus-visible:bg-card-background focus-visible:ring-2 focus-visible:ring-ring hover:bg-card-background hover:opacity-100 opacity-20 text-text-secondary"
                aria-label="Time entry actions">
                <svg
                    class="w-8 h-8 p-1 rounded-full"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M12 5.92A.96.96 0 1 0 12 4a.96.96 0 0 0 0 1.92m0 7.04a.96.96 0 1 0 0-1.92a.96.96 0 0 0 0 1.92M12 20a.96.96 0 1 0 0-1.92a.96.96 0 0 0 0 1.92" />
                </svg>
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="min-w-[150px]" align="end">
            <DropdownMenuItem
                class="flex items-center space-x-3 cursor-pointer"
                @click="emit('manualEntry')">
                <PlusIcon class="w-5" />
                <span>{{ $t('dashboard.Manual time entry') }}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
                v-if="props.hasActiveTimer"
                class="flex items-center space-x-3 cursor-pointer text-destructive focus:text-destructive"
                @click="emit('discard')">
                <XMarkIcon class="w-5" />
                <span>{{ $t('dashboard.Discard') }}</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<style scoped></style>
