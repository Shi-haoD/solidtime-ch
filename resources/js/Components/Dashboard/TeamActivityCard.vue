<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import DashboardCard from '@/Components/Dashboard/DashboardCard.vue';
import TeamActivityCardEntry from '@/Components/Dashboard/TeamActivityCardEntry.vue';
import { UserGroupIcon } from '@heroicons/vue/20/solid';
import SecondaryButton from '@/packages/ui/src/Buttons/SecondaryButton.vue';
import { getCurrentOrganizationId } from '@/utils/useUser';
import { api } from '@/packages/api/src';
import { LoadingSpinner } from '@/packages/ui/src';
import { router } from '@inertiajs/vue3';

// Get the organization ID using the utility function
const organizationId = computed(() => getCurrentOrganizationId());

// Set up the query
const { data: latestTeamActivity, isLoading } = useQuery({
    queryKey: ['latestTeamActivity', organizationId],
    queryFn: () => {
        return api.latestTeamActivity({
            params: {
                organization: organizationId.value!,
            },
        });
    },
    enabled: computed(() => !!organizationId.value),
});
</script>

<template>
    <DashboardCard :title="$t('dashboard.Team Activity')" :icon="UserGroupIcon">
        <div v-if="isLoading" class="flex items-center justify-center h-40">
            <LoadingSpinner />
        </div>
        <div v-else-if="latestTeamActivity">
            <TeamActivityCardEntry
                v-for="activity in latestTeamActivity"
                :key="activity.time_entry_id"
                :class="latestTeamActivity.length === 4 ? 'last:border-0' : ''"
                :name="activity.name"
                :description="activity.description"
                :working="activity.status"></TeamActivityCardEntry>
        </div>
        <div v-else class="py-8 text-center text-gray-500">
            {{ $t('dashboard.No team activity found') }}
        </div>
        <div
            v-if="latestTeamActivity && latestTeamActivity.length <= 1"
            class="flex items-center justify-center flex-1 text-center">
            <div>
                <UserGroupIcon class="inline w-8 pb-2 text-icon-default"></UserGroupIcon>
                <h3 class="text-sm font-semibold text-text-primary">
                    {{ $t('dashboard.Invite your co-workers') }}
                </h3>
                <p class="pb-5 text-sm">{{ $t('dashboard.You can invite your entire team') }}</p>
                <SecondaryButton @click="router.visit(route('members'))"
                    >{{ $t('dashboard.Go to Members') }}
                </SecondaryButton>
            </div>
        </div>
    </DashboardCard>
</template>
