<script setup lang="ts">
import TextInput from '@/packages/ui/src/Input/TextInput.vue';
import SecondaryButton from '@/packages/ui/src/Buttons/SecondaryButton.vue';
import DialogModal from '@/packages/ui/src/DialogModal.vue';
import { computed, nextTick, ref, watch } from 'vue';
import PrimaryButton from '@/packages/ui/src/Buttons/PrimaryButton.vue';
import TimeTrackerProjectTaskDropdown from '@/packages/ui/src/TimeTracker/TimeTrackerProjectTaskDropdown.vue';
import InputLabel from '@/packages/ui/src/Input/InputLabel.vue';
import { TagIcon } from '@heroicons/vue/20/solid';
import { getLocalizedDayJs } from '@/packages/ui/src/utils/time';
import type {
    CreateClientBody,
    CreateProjectBody,
    Project,
    Client,
    TimeEntry,
} from '@/packages/api/src';
import TagDropdown from '@/packages/ui/src/Tag/TagDropdown.vue';
import { Badge } from '@/packages/ui/src';
import BillableIcon from '@/packages/ui/src/Icons/BillableIcon.vue';
import SelectDropdown from '@/packages/ui/src/Input/SelectDropdown.vue';
import DatePicker from '@/packages/ui/src/Input/DatePicker.vue';
import DurationHumanInput from '@/packages/ui/src/Input/DurationHumanInput.vue';

import { InformationCircleIcon } from '@heroicons/vue/20/solid';
import type { Tag, Task } from '@/packages/api/src';
import TimePickerSimple from '@/packages/ui/src/Input/TimePickerSimple.vue';

const show = defineModel('show', { default: false });
const saving = ref(false);
const deleting = ref(false);

const props = defineProps<{
    timeEntry: TimeEntry | null;
    enableEstimatedTime: boolean;
    updateTimeEntry: (entry: TimeEntry) => Promise<void>;
    deleteTimeEntry: (timeEntryId: string) => Promise<void>;
    createClient: (client: CreateClientBody) => Promise<Client | undefined>;
    createProject: (project: CreateProjectBody) => Promise<Project | undefined>;
    createTag: (name: string) => Promise<Tag | undefined>;
    tags: Tag[];
    projects: Project[];
    tasks: Task[];
    clients: Client[];
    currency: string;
    canCreateProject: boolean;
}>();

const description = ref<HTMLInputElement | null>(null);

watch(show, (value) => {
    if (value) {
        nextTick(() => {
            description.value?.focus();
        });
    }
});

const editableTimeEntry = ref<TimeEntry | null>(null);

watch(
    () => props.timeEntry,
    (newTimeEntry) => {
        if (newTimeEntry) {
            editableTimeEntry.value = { ...newTimeEntry };
        }
    },
    { immediate: true }
);

const localStart = computed({
    get: () =>
        editableTimeEntry.value ? getLocalizedDayJs(editableTimeEntry.value.start).format() : '',
    set: (value: string) => {
        if (editableTimeEntry.value) {
            editableTimeEntry.value.start = getLocalizedDayJs(value).utc().format();
            if (getLocalizedDayJs(localEnd.value).isBefore(getLocalizedDayJs(value))) {
                localEnd.value = value;
            }
        }
    },
});

const localEnd = computed({
    get: () =>
        editableTimeEntry.value ? getLocalizedDayJs(editableTimeEntry.value.end).format() : '',
    set: (value: string) => {
        if (editableTimeEntry.value) {
            editableTimeEntry.value.end = getLocalizedDayJs(value).utc().format();
        }
    },
});

async function submit() {
    if (editableTimeEntry.value) {
        saving.value = true;
        try {
            await props.updateTimeEntry(editableTimeEntry.value);
            show.value = false;
        } finally {
            saving.value = false;
        }
    }
}

async function deleteEntry() {
    if (editableTimeEntry.value) {
        deleting.value = true;
        try {
            await props.deleteTimeEntry(editableTimeEntry.value.id);
            show.value = false;
        } finally {
            deleting.value = false;
        }
    }
}

const billableProxy = computed({
    get: () =>
        editableTimeEntry.value ? (editableTimeEntry.value.billable ? 'true' : 'false') : 'false',
    set: (value: string) => {
        if (editableTimeEntry.value) {
            editableTimeEntry.value.billable = value === 'true';
        }
    },
});

type BillableOption = {
    label: string;
    value: string;
};
</script>

<template>
    <DialogModal closeable :show="show" @close="show = false">
        <template #title>
            <div class="flex space-x-2">
                <span>{{ $t('Time.Edit time entry') }}</span>
            </div>
        </template>

        <template #content>
            <div v-if="editableTimeEntry" class="space-y-4">
                <div class="items-end space-y-2 sm:flex sm:space-y-0 sm:space-x-4">
                    <div class="flex-1">
                        <TextInput
                            id="description"
                            ref="description"
                            v-model="editableTimeEntry.description"
                            :placeholder="$t('dashboard.What did you work on')"
                            type="text"
                            class="block w-full mt-1"
                            @keydown.enter="submit" />
                    </div>
                </div>
                <div
                    class="items-end justify-between pt-4 space-y-2 sm:flex sm:space-y-0 sm:space-x-4">
                    <div class="flex items-center justify-between w-full space-x-2">
                        <div class="flex-1 min-w-0">
                            <TimeTrackerProjectTaskDropdown
                                v-model:project="editableTimeEntry.project_id"
                                v-model:task="editableTimeEntry.task_id"
                                :clients
                                :create-project
                                :create-client
                                :can-create-project="canCreateProject"
                                :currency="currency"
                                size="xlarge"
                                class="bg-input-background"
                                :projects="projects"
                                :tasks="tasks"
                                :enable-estimated-time="
                                    enableEstimatedTime
                                "></TimeTrackerProjectTaskDropdown>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="flex-col">
                                <TagDropdown
                                    v-model="editableTimeEntry.tags"
                                    :create-tag
                                    :tags="tags">
                                    <template #trigger>
                                        <Badge
                                            class="bg-input-background"
                                            tag="button"
                                            size="xlarge">
                                            <TagIcon
                                                v-if="editableTimeEntry.tags.length === 0"
                                                class="w-4"></TagIcon>
                                            <div
                                                v-else
                                                class="flex items-center justify-center w-5 h-5 font-medium transition rounded bg-accent-300/20">
                                                {{ editableTimeEntry.tags.length }}
                                            </div>
                                            <span>{{ $t('Time.Tags') }}</span>
                                        </Badge>
                                    </template>
                                </TagDropdown>
                            </div>
                            <div class="flex-col">
                                <SelectDropdown
                                    v-model="billableProxy"
                                    :get-key-from-item="(item: BillableOption) => item.value"
                                    :get-name-for-item="(item: BillableOption) => item.label"
                                    :items="[
                                        {
                                            label: 'Billable',
                                            value: 'true',
                                        },
                                        {
                                            label: 'Non Billable',
                                            value: 'false',
                                        },
                                    ]">
                                    <template #trigger>
                                        <Badge
                                            class="bg-input-background"
                                            tag="button"
                                            size="xlarge">
                                            <BillableIcon class="h-4"></BillableIcon>
                                            <span>{{
                                                editableTimeEntry.billable
                                                    ? $t('Time.Billable')
                                                    : $t('Time.Non-Billable')
                                            }}</span>
                                        </Badge>
                                    </template>
                                </SelectDropdown>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex pt-4 space-x-4">
                    <div class="flex-1">
                        <InputLabel>{{ $t('Time.Duration') }}</InputLabel>
                        <div class="flex flex-col mt-1 space-y-2">
                            <DurationHumanInput
                                v-model:start="localStart"
                                v-model:end="localEnd"
                                name="Duration"></DurationHumanInput>
                            <div class="flex space-x-1 text-sm">
                                <InformationCircleIcon
                                    class="w-4 text-text-quaternary"></InformationCircleIcon>
                                <span class="text-xs text-text-secondary">
                                    {{ $t('dashboard.You can type natural language') }}
                                    <span class="font-semibold"> 2h 30m</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="">
                        <InputLabel>{{ $t('Time.Start') }}</InputLabel>
                        <div class="flex flex-col items-center mt-1 space-y-2">
                            <TimePickerSimple v-model="localStart" size="large"></TimePickerSimple>
                            <DatePicker
                                v-model="localStart"
                                tabindex="1"
                                class="text-xs text-text-tertiary max-w-28 px-1.5 py-1.5"></DatePicker>
                        </div>
                    </div>
                    <div class="">
                        <InputLabel>{{ $t('Time.End') }}</InputLabel>
                        <div class="flex flex-col items-center mt-1 space-y-2">
                            <TimePickerSimple v-model="localEnd" size="large"></TimePickerSimple>
                            <DatePicker
                                v-model="localEnd"
                                tabindex="1"
                                class="text-xs text-text-tertiary max-w-28 px-1.5 py-1.5"></DatePicker>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-between w-full">
                <SecondaryButton
                    tabindex="2"
                    class="text-white bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                    :disabled="deleting || saving"
                    @click="deleteEntry">
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </SecondaryButton>
                <div class="flex space-x-3">
                    <SecondaryButton tabindex="2" @click="show = false">{{
                        $t('Time.Cancel')
                    }}</SecondaryButton>
                    <PrimaryButton
                        tabindex="2"
                        :class="{ 'opacity-25': saving }"
                        :disabled="saving || deleting"
                        @click="submit">
                        {{ saving ? 'Updating...' : 'Update Time Entry' }}
                    </PrimaryButton>
                </div>
            </div>
        </template>
    </DialogModal>
</template>

<style scoped></style>
