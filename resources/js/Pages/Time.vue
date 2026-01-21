<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue';
import TimeTracker from '@/Components/TimeTracker.vue';
import { onMounted, ref, watch } from 'vue';
import MainContainer from '@/packages/ui/src/MainContainer.vue';
import { useTimeEntriesStore } from '@/utils/useTimeEntries';
import { storeToRefs } from 'pinia';
import type {
    CreateClientBody,
    CreateProjectBody,
    CreateTimeEntryBody,
    Project,
    TimeEntry,
    Client,
} from '@/packages/api/src';
import { useElementVisibility } from '@vueuse/core';
import { ClockIcon } from '@heroicons/vue/20/solid';
import LoadingSpinner from '@/packages/ui/src/LoadingSpinner.vue';
import { useCurrentTimeEntryStore } from '@/utils/useCurrentTimeEntry';
import { useTasksStore } from '@/utils/useTasks';
import { useProjectsStore } from '@/utils/useProjects';
import TimeEntryGroupedTable from '@/packages/ui/src/TimeEntry/TimeEntryGroupedTable.vue';
import { useTagsStore } from '@/utils/useTags';
import { useClientsStore } from '@/utils/useClients';
import { getOrganizationCurrencyString } from '@/utils/money';
import TimeEntryMassActionRow from '@/packages/ui/src/TimeEntry/TimeEntryMassActionRow.vue';
import type { UpdateMultipleTimeEntriesChangeset } from '@/packages/api/src';
import { isAllowedToPerformPremiumAction } from '@/utils/billing';
import { canCreateProjects } from '@/utils/permissions';

const timeEntriesStore = useTimeEntriesStore();
const { timeEntries, allTimeEntriesLoaded } = storeToRefs(timeEntriesStore);
const { updateTimeEntry, fetchTimeEntries, createTimeEntry } = useTimeEntriesStore();

async function updateTimeEntries(ids: string[], changes: UpdateMultipleTimeEntriesChangeset) {
    await useTimeEntriesStore().updateTimeEntries(ids, changes);
    fetchTimeEntries();
}

const loading = ref(false);
const loadMoreContainer = ref<HTMLDivElement | null>(null);
const isLoadMoreVisible = useElementVisibility(loadMoreContainer);
const currentTimeEntryStore = useCurrentTimeEntryStore();
const { currentTimeEntry } = storeToRefs(currentTimeEntryStore);
const { setActiveState } = currentTimeEntryStore;
const { tags } = storeToRefs(useTagsStore());

async function startTimeEntry(timeEntry: Omit<CreateTimeEntryBody, 'member_id'>) {
    if (currentTimeEntry.value.id) {
        await setActiveState(false);
    }
    await createTimeEntry(timeEntry);
    fetchTimeEntries();
    useCurrentTimeEntryStore().fetchCurrentTimeEntry();
}

function deleteTimeEntries(timeEntries: TimeEntry[]) {
    useTimeEntriesStore().deleteTimeEntries(timeEntries);
    fetchTimeEntries();
}

watch(isLoadMoreVisible, async (isVisible) => {
    if (isVisible && timeEntries.value.length > 0 && !allTimeEntriesLoaded.value) {
        loading.value = true;
        await timeEntriesStore.fetchMoreTimeEntries();
    }
});

onMounted(async () => {
    await timeEntriesStore.fetchTimeEntries();
});

const projectStore = useProjectsStore();
const { projects } = storeToRefs(projectStore);
const taskStore = useTasksStore();
const { tasks } = storeToRefs(taskStore);
const clientStore = useClientsStore();
const { clients } = storeToRefs(clientStore);

async function createTag(name: string) {
    return await useTagsStore().createTag(name);
}
async function createProject(project: CreateProjectBody): Promise<Project | undefined> {
    return await useProjectsStore().createProject(project);
}
async function createClient(body: CreateClientBody): Promise<Client | undefined> {
    return await useClientsStore().createClient(body);
}

const selectedTimeEntries = ref([] as TimeEntry[]);

async function clearSelectionAndState() {
    selectedTimeEntries.value = [];
    await fetchTimeEntries();
}

function deleteSelected() {
    deleteTimeEntries(selectedTimeEntries.value);
    selectedTimeEntries.value = [];
}
</script>

<template>
    <AppLayout title="Dashboard" data-testid="time_view">
        <MainContainer class="pt-5 pb-4 lg:pt-8 lg:pb-6">
            <TimeTracker></TimeTracker>
        </MainContainer>
        <TimeEntryMassActionRow
            :selected-time-entries="selectedTimeEntries"
            :enable-estimated-time="isAllowedToPerformPremiumAction()"
            :can-create-project="canCreateProjects()"
            :all-selected="selectedTimeEntries.length === timeEntries.length"
            :delete-selected="deleteSelected"
            :projects="projects"
            :tasks="tasks"
            :tags="tags"
            :currency="getOrganizationCurrencyString()"
            :clients="clients"
            class="border-t border-default-background-separator"
            :update-time-entries="
                (args) =>
                    updateTimeEntries(
                        selectedTimeEntries.map((timeEntry) => timeEntry.id),
                        args
                    )
            "
            :create-project="createProject"
            :create-client="createClient"
            :create-tag="createTag"
            @submit="clearSelectionAndState"
            @select-all="selectedTimeEntries = [...timeEntries]"
            @unselect-all="selectedTimeEntries = []"></TimeEntryMassActionRow>
        <TimeEntryGroupedTable
            v-model:selected="selectedTimeEntries"
            :create-project
            :enable-estimated-time="isAllowedToPerformPremiumAction()"
            :can-create-project="canCreateProjects()"
            :clients
            :create-client
            :update-time-entry
            :update-time-entries
            :delete-time-entries
            :create-time-entry="startTimeEntry"
            :create-tag
            :projects="projects"
            :tasks="tasks"
            :currency="getOrganizationCurrencyString()"
            :time-entries="timeEntries"
            :tags="tags"></TimeEntryGroupedTable>
        <div v-if="timeEntries.length === 0" class="pt-12 text-center">
            <ClockIcon class="inline w-8 pb-2 text-icon-default"></ClockIcon>
            <h3 class="font-semibold text-text-primary">{{ $t('Time.No time entries found') }}</h3>
            <p class="pb-5">{{ $t('Time.Create your first time entry now!') }}</p>
        </div>
        <div ref="loadMoreContainer">
            <div
                v-if="loading && !allTimeEntriesLoaded"
                class="flex items-center justify-center py-5 font-medium text-text-primary">
                <LoadingSpinner></LoadingSpinner>
                <span>{{ $t('Time.Loading more time entries') }}</span>
            </div>
            <div
                v-else-if="allTimeEntriesLoaded"
                class="flex items-center justify-center py-5 font-medium text-text-secondary">
                {{ $t('Time.All time entries are loaded!') }}
            </div>
        </div>
    </AppLayout>
</template>
