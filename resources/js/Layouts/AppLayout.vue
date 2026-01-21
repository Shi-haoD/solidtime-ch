<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3';
import Banner from '@/Components/Banner.vue';
import OrganizationSwitcher from '@/Components/OrganizationSwitcher.vue';
import CurrentSidebarTimer from '@/Components/CurrentSidebarTimer.vue';
import {
    Bars3Icon,
    CalendarIcon,
    ChartBarIcon,
    ClockIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    FolderIcon,
    HomeIcon,
    TagIcon,
    UserCircleIcon,
    UserGroupIcon,
    XMarkIcon,
    DocumentTextIcon,
} from '@heroicons/vue/20/solid';
import NavigationSidebarItem from '@/Components/NavigationSidebarItem.vue';
import UserSettingsIcon from '@/Components/UserSettingsIcon.vue';
import MainContainer from '@/packages/ui/src/MainContainer.vue';
import { computed, onMounted, provide, ref } from 'vue';
import NotificationContainer from '@/Components/NotificationContainer.vue';
import { initializeStores, refreshStores } from '@/utils/init';
import {
    canManageBilling,
    canUpdateOrganization,
    canViewClients,
    canViewInvoices,
    canViewMembers,
    canViewProjects,
    canViewReport,
    canViewTags,
} from '@/utils/permissions';
import { isBillingActivated, isInvoicingActivated } from '@/utils/billing';
import type { User } from '@/types/models';
import { ArrowsRightLeftIcon } from '@heroicons/vue/16/solid';
import { fetchToken, isTokenValid } from '@/utils/session';
import UpdateSidebarNotification from '@/Components/UpdateSidebarNotification.vue';
import BillingBanner from '@/Components/Billing/BillingBanner.vue';
import UserTimezoneMismatchModal from '@/Components/Common/User/UserTimezoneMismatchModal.vue';
import { useTheme } from '@/utils/theme';
import { useQuery } from '@tanstack/vue-query';
import { api } from '@/packages/api/src';
import { getCurrentOrganizationId } from '@/utils/useUser';
import LoadingSpinner from '@/packages/ui/src/LoadingSpinner.vue';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/packages/ui/src';
import { openFeedback } from '@/utils/feedback';

defineProps({
    title: String,
    mainClass: String,
});

const showSidebarMenu = ref(false);
const isUnloading = ref(false);

const { data: organization, isLoading: isOrganizationLoading } = useQuery({
    queryKey: ['organization', getCurrentOrganizationId()],
    queryFn: () =>
        api.getOrganization({
            params: {
                organization: getCurrentOrganizationId()!,
            },
        }),
    enabled: !!getCurrentOrganizationId(),
});

provide(
    'organization',
    computed(() => organization.value?.data)
);

onMounted(async () => {
    useTheme();
    // make sure that the initial requests are only loaded once, this can be removed once we move away from inertia
    if (window.initialDataLoaded !== true) {
        window.initialDataLoaded = true;
        initializeStores();
    }
    window.onbeforeunload = () => {
        isUnloading.value = true;
    };
    window.onfocus = async () => {
        if (!isTokenValid()) {
            await fetchToken();
        }
        setTimeout(() => {
            // prevent store refreshing on navigation
            if (isUnloading.value === false) {
                refreshStores();
            }
        }, 100);
    };
});
const page = usePage<{
    has_services_extension?: boolean;
    auth: {
        user: User;
    };
}>();
</script>

<template>
    <div v-bind="$attrs" class="flex flex-wrap bg-background text-text-secondary">
        <div
            :class="{
                '!flex bg-default-background w-full z-30': showSidebarMenu,
            }"
            class="flex-shrink-0 h-screen hidden fixed w-[230px] 2xl:w-[250px] px-2.5 2xl:px-3 py-4 lg:flex flex-col justify-between">
            <div class="flex flex-col h-full">
                <div class="flex justify-between pb-2 border-b border-default-background-separator">
                    <OrganizationSwitcher class="w-full"></OrganizationSwitcher>
                    <XMarkIcon class="w-8 lg:hidden" @click="showSidebarMenu = false"></XMarkIcon>
                </div>
                <div class="border-b border-default-background-separator">
                    <CurrentSidebarTimer></CurrentSidebarTimer>
                </div>
                <div
                    class="flex-1 w-full overflow-y-scroll"
                    style="
                        scrollbar-width: thin;
                        scrollbar-color: var(--color-bg-primary) transparent;
                    ">
                    <nav class="pt-2">
                        <ul>
                            <NavigationSidebarItem
                                :title="$t('NavigationSidebarItem.dashboard')"
                                :icon="HomeIcon"
                                :href="route('dashboard')"
                                :current="route().current('dashboard')"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                :title="$t('NavigationSidebarItem.Time')"
                                :icon="ClockIcon"
                                :current="route().current('time')"
                                :href="route('time')"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                :title="$t('NavigationSidebarItem.Calendar')"
                                :icon="CalendarIcon"
                                :current="route().current('calendar')"
                                :href="route('calendar')"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                :title="$t('NavigationSidebarItem.Reporting')"
                                :icon="ChartBarIcon"
                                :sub-items="[
                                    {
                                        title: $t('NavigationSidebarItem.Overview'),
                                        route: 'reporting',
                                        show: true,
                                    },
                                    {
                                        title: $t('NavigationSidebarItem.Detailed'),
                                        route: 'reporting.detailed',
                                        show: true,
                                    },
                                    {
                                        title: $t('NavigationSidebarItem.Shared'),
                                        route: 'reporting.shared',
                                        show: canViewReport(),
                                    },
                                ]"
                                :current="
                                    route().current('reporting') ||
                                    route().current('reporting.detailed') ||
                                    route().current('reporting.shared')
                                "
                                :href="route('reporting')">
                            </NavigationSidebarItem>
                        </ul>
                    </nav>

                    <div class="text-text-tertiary text-xs font-semibold pt-5 pb-1.5">
                        {{ $t('NavigationSidebarItem.Manage') }}
                    </div>

                    <nav>
                        <ul>
                            <NavigationSidebarItem
                                v-if="canViewProjects()"
                                :title="$t('NavigationSidebarItem.Projects')"
                                :icon="FolderIcon"
                                :href="route('projects')"
                                :current="route().current('projects')"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                v-if="canViewClients()"
                                :title="$t('NavigationSidebarItem.Clients')"
                                :icon="UserCircleIcon"
                                :current="route().current('clients')"
                                :href="route('clients')"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                v-if="canViewMembers()"
                                :title="$t('NavigationSidebarItem.Members')"
                                :icon="UserGroupIcon"
                                :current="route().current('members')"
                                :href="route('members')"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                v-if="canViewTags()"
                                :title="$t('NavigationSidebarItem.Tags')"
                                :icon="TagIcon"
                                :current="route().current('tags')"
                                :href="route('tags')"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                v-if="isInvoicingActivated() && canViewInvoices()"
                                :title="$t('NavigationSidebarItem.Invoices')"
                                :icon="DocumentTextIcon"
                                :current="route().current('invoices')"
                                href="/invoices"></NavigationSidebarItem>
                        </ul>
                    </nav>
                    <div
                        v-if="canUpdateOrganization()"
                        class="text-text-tertiary text-xs font-semibold pt-5 pb-1.5">
                        {{ $t('NavigationSidebarItem.Administration') }}
                    </div>

                    <nav>
                        <ul>
                            <NavigationSidebarItem
                                v-if="canManageBilling() && isBillingActivated()"
                                :title="$t('NavigationSidebarItem.Billing')"
                                :icon="CreditCardIcon"
                                href="/billing"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                v-if="canUpdateOrganization()"
                                :title="$t('NavigationSidebarItem.ImportExport')"
                                :icon="ArrowsRightLeftIcon"
                                :current="route().current('import')"
                                :href="route('import')"></NavigationSidebarItem>
                            <NavigationSidebarItem
                                v-if="canUpdateOrganization()"
                                :title="$t('NavigationSidebarItem.Settings')"
                                :icon="Cog6ToothIcon"
                                :href="route('teams.show', page.props.auth.user.current_team.id)"
                                :current="
                                    route().current(
                                        'teams.show',
                                        page.props.auth.user.current_team.id
                                    )
                                "></NavigationSidebarItem>
                        </ul>
                    </nav>
                </div>
                <div class="justify-self-end">
                    <UpdateSidebarNotification></UpdateSidebarNotification>
                    <ul
                        class="flex items-center justify-between gap-1 pt-3 pr-2 border-t border-default-background-separator">
                        <UserSettingsIcon></UserSettingsIcon>

                        <NavigationSidebarItem
                            class="flex-1"
                            title="Profile Settings"
                            :icon="Cog6ToothIcon"
                            :href="route('profile.show')"></NavigationSidebarItem>

                        <Button
                            v-if="page.props.has_services_extension"
                            variant="outline"
                            size="xs"
                            class="flex items-center justify-center w-6 h-6 ml-2 text-xs rounded-full text-icon-default"
                            @click="openFeedback">
                            ?
                        </Button>
                    </ul>
                </div>
            </div>
        </div>
        <div class="flex-1 lg:ml-[230px] 2xl:ml-[250px] min-w-0">
            <div
                class="flex flex-col h-screen overflow-y-auto border-l bg-default-background border-default-background-separator">
                <div
                    class="flex items-center justify-between w-full px-3 py-1 border-b lg:hidden border-b-default-background-separator text-text-secondary">
                    <Bars3Icon
                        class="w-7 text-text-secondary"
                        @click="showSidebarMenu = !showSidebarMenu"></Bars3Icon>
                    <OrganizationSwitcher></OrganizationSwitcher>
                </div>

                <Head :title="title" />

                <!-- Page Heading -->
                <Banner />
                <BillingBanner v-if="isBillingActivated()" />

                <header
                    v-if="$slots.header"
                    class="border-b shadow bg-default-background border-default-background-separator">
                    <div class="pt-8 pb-3">
                        <MainContainer>
                            <slot name="header" />
                        </MainContainer>
                    </div>
                </header>

                <!-- Page Content -->
                <main :class="twMerge('pb-28 relative flex-1', mainClass)">
                    <div
                        v-if="isOrganizationLoading"
                        class="flex items-center justify-center h-screen">
                        <LoadingSpinner />
                    </div>
                    <slot v-else />
                </main>
            </div>
        </div>
    </div>
    <NotificationContainer></NotificationContainer>
    <UserTimezoneMismatchModal></UserTimezoneMismatchModal>
</template>
