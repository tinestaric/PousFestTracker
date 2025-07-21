'use client'

import { useState } from 'react'
import { Home } from 'lucide-react'
import Link from 'next/link'
import { getEventConfig, getInterpolatedText, getText } from '@/lib/eventConfig'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'

// Import all our modular components
import {
  StatsCards,
  TabNavigation,
  OverviewTab,
  GuestsTab,
  AchievementsTab,
  DrinksTab,
  RecipesTab,
  FoodTab,
  EditModal,
  ConfirmModal,
  ToastContainer,
  useAdminData,
  useAdminEditing,
  type ActiveTab
} from './components'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

export default function AdminDashboard() {
  const config = getEventConfig()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  
  // Custom hooks for data management and editing
  const { data, stats, loading, refetch } = useAdminData()
  const editing = useAdminEditing(refetch)

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} relative overflow-hidden flex items-center justify-center`}>
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-6"></div>
          <p className="text-white text-xl font-semibold drop-shadow-lg">Nalagam admin nadzorno ploščo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.ui.heroGradient} relative overflow-hidden`}>
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-white/5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{getText('admin.title', config)}</h1>
              <p className="text-white/90 text-lg">{getInterpolatedText('admin.subtitle', config)}</p>
            </div>
            <Link href="/" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg">
              <Home className="w-4 h-4" />
              {getText('buttons.home', config)}
            </Link>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OverviewTab data={data} />
          )}
          
          {activeTab === 'guests' && (
            <GuestsTab
              guests={data.guests}
              editing={editing.editing}
              showAddForm={editing.showAddForm}
              validation={editing.validation}
              loading={editing.loading}
              onStartAdd={editing.startAdd}
              onStartEdit={editing.startEdit}
              onCancelEdit={editing.cancelEdit}
              onSave={editing.handleSave}
              onDelete={editing.handleDelete}
              onUpdateEditingData={editing.updateEditingData}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementsTab
              achievements={data.achievements}
              guestAchievements={data.guestAchievements}
              editing={editing.editing}
              showAddForm={editing.showAddForm}
              validation={editing.validation}
              loading={editing.loading}
              onStartAdd={editing.startAdd}
              onStartEdit={editing.startEdit}
              onDelete={editing.handleDelete}
              onCancelEdit={editing.cancelEdit}
              onSave={editing.handleSave}
              onUpdateEditingData={editing.updateEditingData}
            />
          )}

          {activeTab === 'drinks' && (
            <DrinksTab
              drinks={data.drinks}
              drinkOrders={data.drinkOrders}
              editing={editing.editing}
              showAddForm={editing.showAddForm}
              validation={editing.validation}
              loading={editing.loading}
              onStartAdd={editing.startAdd}
              onStartEdit={editing.startEdit}
              onDelete={editing.handleDelete}
              onCancelEdit={editing.cancelEdit}
              onSave={editing.handleSave}
              onUpdateEditingData={editing.updateEditingData}
            />
          )}

          {activeTab === 'recipes' && (
            <RecipesTab
              recipes={data.recipes}
              drinks={data.drinks}
              editing={editing.editing}
              showAddForm={editing.showAddForm}
              validation={editing.validation}
              loading={editing.loading}
              onStartAdd={editing.startAdd}
              onStartEdit={editing.startEdit}
              onDelete={editing.handleDelete}
              onCancelEdit={editing.cancelEdit}
              onSave={editing.handleSave}
              onUpdateEditingData={editing.updateEditingData}
            />
          )}

          {activeTab === 'food' && (
            <FoodTab
              foodMenu={data.foodMenu}
              foodOrders={data.foodOrders}
              editing={editing.editing}
              showAddForm={editing.showAddForm}
              validation={editing.validation}
              loading={editing.loading}
              onStartAdd={editing.startAdd}
              onStartEdit={editing.startEdit}
              onDelete={editing.handleDelete}
              onCancelEdit={editing.cancelEdit}
              onSave={editing.handleSave}
              onUpdateEditingData={editing.updateEditingData}
            />
          )}

          {/* Edit Modal */}
          <EditModal
            editing={editing.editing}
            drinks={data.drinks}
            validation={editing.validation}
            loading={editing.loading}
            onSave={editing.handleSave}
            onCancel={editing.cancelEdit}
            onUpdateEditingData={editing.updateEditingData}
          />

          {/* Confirmation Modal */}
          <ConfirmModal
            isOpen={editing.confirmAction.isOpen}
            title={editing.confirmAction.title}
            message={editing.confirmAction.message}
            onConfirm={editing.confirmDelete}
            onCancel={editing.cancelConfirm}
            isLoading={editing.loading.isLoading && editing.loading.operation === 'deleting'}
          />
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer 
        errors={editing.errors} 
        onDismiss={editing.dismissError} 
      />
    </div>
  )
} 