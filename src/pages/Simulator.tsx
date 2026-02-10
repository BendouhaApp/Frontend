import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { useGet } from '@/hooks/useGet'
import { useQuery } from '@tanstack/react-query'
import type {
  Product,
  ProductsResponse,
  RoomTemplate,
  RoomTemplatesResponse,
  RoomTypeKey,
  SimulateRoomRequest,
  SimulateRoomResponse,
} from '@/types/api'
import { roomTemplatesFallback } from '@/data/roomTemplates'
import { RoomScene, type LightSettings } from '@/components/simulator/RoomScene'
import { cn } from '@/lib/utils'
import { DURATION, EASE, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import { apiClient } from '@/lib/http'

const formatNumber = (value: number, digits = 1) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)

const hasRequiredSpecs = (product: Product) => {
  const values = [
    product.cct,
    product.lumen,
    product.cri,
    product.power,
    product.angle,
  ]
  return values.every((value) => typeof value === 'number' && value > 0)
}

export function Simulator() {
  const { t } = useTranslation()
  const { data: roomsData, isError: roomsError } =
    useGet<RoomTemplatesResponse>({
      path: 'rooms/templates',
      options: {
        staleTime: 1000 * 60 * 30,
      },
    })

  const { data: productsData, isError: productsError, isLoading: productsLoading } =
    useGet<ProductsResponse>({
      path: 'products/public',
      options: {
        staleTime: 1000 * 60 * 5,
      },
    })

  const roomTemplates = useMemo<RoomTemplate[]>(
    () =>
      roomsData?.data?.length
        ? roomsData.data
        : roomTemplatesFallback,
    [roomsData?.data],
  )

  const [selectedRoomKey, setSelectedRoomKey] = useState<RoomTypeKey | null>(
    roomTemplatesFallback[0]?.key ?? null,
  )
  const [dimensions, setDimensions] = useState(
    roomTemplatesFallback[0]?.defaultDimensions ?? {
      width: 4,
      length: 5,
      height: 2.7,
      unit: 'm',
    },
  )
  const [selectedObstacleIds, setSelectedObstacleIds] = useState<string[]>(
    roomTemplatesFallback[0]?.obstacles?.map((obstacle) => obstacle.id) ?? [],
  )

  const eligibleProducts = useMemo(
    () => (productsData?.data ?? []).filter(hasRequiredSpecs),
    [productsData?.data],
  )

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const resolvedRoomKey = useMemo(() => {
    if (selectedRoomKey && roomTemplates.some((room) => room.key === selectedRoomKey)) {
      return selectedRoomKey
    }
    return roomTemplates[0]?.key ?? null
  }, [roomTemplates, selectedRoomKey])

  const selectedTemplate =
    roomTemplates.find((room) => room.key === resolvedRoomKey) ?? roomTemplates[0]

  const resolvedProductId = useMemo(() => {
    if (!eligibleProducts.length) return null
    if (selectedProductId && eligibleProducts.some((p) => p.id === selectedProductId)) {
      return selectedProductId
    }
    return eligibleProducts[0].id
  }, [eligibleProducts, selectedProductId])

  const selectedProduct = eligibleProducts.find(
    (product) => product.id === resolvedProductId,
  )

  const simulationPayload = useMemo<SimulateRoomRequest | null>(() => {
    if (!selectedProduct || !selectedTemplate || !resolvedRoomKey) return null
    return {
      roomType: resolvedRoomKey,
      dimensions: {
        width: dimensions.width,
        length: dimensions.length,
        height: dimensions.height,
        unit: 'm',
      },
      obstacles: selectedObstacleIds,
      product: {
        cct: selectedProduct.cct ?? 0,
        lumen: selectedProduct.lumen ?? 0,
        cri: selectedProduct.cri ?? 0,
        power: selectedProduct.power ?? 0,
        angle: selectedProduct.angle ?? 0,
      },
    }
  }, [
    dimensions.height,
    dimensions.length,
    dimensions.width,
    resolvedRoomKey,
    selectedObstacleIds,
    selectedProduct,
    selectedTemplate,
  ])

  const {
    data: simulationData,
    isError: simulationError,
    isFetching: simulationLoading,
  } = useQuery<SimulateRoomResponse>({
    queryKey: ['rooms', 'simulate', simulationPayload],
    queryFn: async () => {
      if (!simulationPayload) {
        throw new Error('Missing simulation payload')
      }
      const response = await apiClient.post('rooms/simulate', {
        json: simulationPayload,
      })
      return response.json()
    },
    enabled: Boolean(simulationPayload),
    staleTime: 0,
    retry: 1,
  })

  const roomArea = dimensions.width * dimensions.length
  const estimatedLuxFallback =
    selectedProduct?.lumen && roomArea > 0
      ? selectedProduct.lumen / roomArea
      : null

  const beamDiameterFallback =
    selectedProduct?.angle && dimensions.height
      ? 2 * dimensions.height * Math.tan(((selectedProduct.angle ?? 0) * Math.PI) / 360)
      : null

  const efficacyFallback =
    selectedProduct?.lumen && selectedProduct?.power
      ? selectedProduct.lumen / selectedProduct.power
      : null

  const resolvedLux = simulationData?.data?.estimatedLux ?? estimatedLuxFallback
  const resolvedBeam =
    simulationData?.data?.beamDiameter ?? beamDiameterFallback
  const resolvedEfficacy =
    simulationData?.data?.efficacy ?? efficacyFallback

  const lightSettings: LightSettings | undefined = selectedProduct
    ? {
        lumen: selectedProduct.lumen ?? 0,
        cct: selectedProduct.cct ?? 3000,
        angle: selectedProduct.angle ?? 90,
        power: selectedProduct.power ?? 0,
        cri: selectedProduct.cri ?? 80,
      }
    : undefined

  const handleDimensionChange = (key: 'width' | 'length' | 'height', value: string) => {
    const numeric = Number(value)
    if (Number.isNaN(numeric)) return
    setDimensions((prev) => ({
      ...prev,
      [key]: Math.max(1, Math.min(15, numeric)),
    }))
  }

  const handleRoomChange = (nextRoom: RoomTypeKey) => {
    setSelectedRoomKey(nextRoom)
    const template = roomTemplates.find((room) => room.key === nextRoom)
    if (template) {
      setDimensions(template.defaultDimensions)
      setSelectedObstacleIds(template.obstacles.map((obstacle) => obstacle.id))
    }
  }

  const toggleObstacle = (id: string) => {
    setSelectedObstacleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.section
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="relative overflow-hidden border-b border-navy-200 bg-gradient-to-br from-navy-900 via-navy-800 to-primary-700 text-white"
      >
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-200">
              {t('simulator.exclusiveBadge')}
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">
              Lighting Lab
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: DURATION.slow, ease: EASE.out }}
            className="mt-5 max-w-2xl font-display text-4xl font-light tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            {t('simulator.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: DURATION.slow, ease: EASE.out }}
            className="mt-4 max-w-2xl text-lg text-white/80"
          >
            {t('simulator.subtitle')}
          </motion.p>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_60%)]" />
      </motion.section>

      <section className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)]"
        >
          <motion.div variants={staggerItem} className="space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {t('simulator.roomSection')}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-navy">
                    {selectedTemplate?.label ?? 'Room'}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {selectedTemplate?.description}
                  </p>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                  {t('simulator.exclusiveBadge')}
                </span>
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium text-neutral-700">
                  {t('simulator.roomTypeLabel')}
                </label>
                <div className="relative mt-2">
                  <select
                    value={resolvedRoomKey ?? ''}
                    onChange={(event) => handleRoomChange(event.target.value as RoomTypeKey)}
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {roomTemplates.map((room) => (
                      <option key={room.key} value={room.key}>
                        {room.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
                {roomsError && (
                  <p className="mt-2 text-xs text-amber-600">
                    {t('simulator.roomFallback')}
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {(['width', 'length', 'height'] as const).map((key) => (
                  <div key={key}>
                    <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {t(`simulator.dimension.${key}`)}
                    </label>
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        max={15}
                        step={0.1}
                        value={dimensions[key]}
                        onChange={(event) => handleDimensionChange(key, event.target.value)}
                        className="w-full bg-transparent text-sm text-neutral-700 focus:outline-none"
                      />
                      <span className="text-xs text-neutral-400">m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {t('simulator.obstaclesSection')}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-navy">
                    {t('simulator.obstaclesTitle')}
                  </h3>
                </div>
                <span className="text-xs font-medium text-neutral-400">
                  {selectedObstacleIds.length} / {selectedTemplate?.obstacles.length ?? 0}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedTemplate?.obstacles.map((obstacle) => {
                  const isActive = selectedObstacleIds.includes(obstacle.id)
                  return (
                    <button
                      key={obstacle.id}
                      type="button"
                      onClick={() => toggleObstacle(obstacle.id)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition',
                        isActive
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/50 hover:text-primary',
                      )}
                    >
                      {obstacle.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {t('simulator.productSection')}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-navy">
                    {t('simulator.productTitle')}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {t('simulator.productSubtitle')}
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                  {eligibleProducts.length} {t('common.items')}
                </span>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-neutral-700">
                  {t('simulator.productLabel')}
                </label>
                <div className="relative mt-2">
                  <select
                    value={resolvedProductId ?? ''}
                    onChange={(event) => setSelectedProductId(event.target.value)}
                    disabled={!eligibleProducts.length}
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-neutral-50"
                  >
                    {!eligibleProducts.length && (
                      <option value="">{t('simulator.noProducts')}</option>
                    )}
                    {eligibleProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  {t('simulator.productFilterNote')}
                </p>
                {(productsError || (!productsLoading && !eligibleProducts.length)) && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4" />
                    <span>
                      {t('simulator.productFallback')}
                    </span>
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="mt-5 grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-600 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">CCT</p>
                    <p className="font-semibold text-neutral-800">
                      {selectedProduct.cct} K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Lumen</p>
                    <p className="font-semibold text-neutral-800">
                      {selectedProduct.lumen} lm
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">CRI</p>
                    <p className="font-semibold text-neutral-800">
                      {selectedProduct.cri}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Power</p>
                    <p className="font-semibold text-neutral-800">
                      {selectedProduct.power} W
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Angle</p>
                    <p className="font-semibold text-neutral-800">
                      {selectedProduct.angle}°
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {t('simulator.resultsSection')}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-navy">
                  {t('simulator.resultsTitle')}
                </h3>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    {t('simulator.resultLux')}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-neutral-800">
                    {resolvedLux ? `${formatNumber(resolvedLux, 0)} lx` : '—'}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    {t('simulator.resultBeam')}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-neutral-800">
                    {resolvedBeam ? `${formatNumber(resolvedBeam, 2)} m` : '—'}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    {t('simulator.resultEfficacy')}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-neutral-800">
                    {resolvedEfficacy ? `${formatNumber(resolvedEfficacy, 0)} lm/W` : '—'}
                  </p>
                </div>
              </div>

              {simulationLoading && (
                <div className="mt-3 text-xs text-neutral-500">
                  {t('simulator.simulationLoading')}
                </div>
              )}

              {(simulationData?.data?.warnings?.length ?? 0) > 0 && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700/80">
                    {t('simulator.warnings')}
                  </p>
                  <ul className="mt-2 list-disc pl-4 text-sm text-amber-700/80">
                    {simulationData?.data?.warnings.map((warning) => (
                      <li key={warning}>
                        {t(`simulator.warning.${warning}`, warning)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {simulationError && (
                <div className="mt-4 text-xs text-amber-600">
                  {t('simulator.simulationFallback')}
                </div>
              )}

              {selectedTemplate?.safetyNotes?.length ? (
                <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                    {t('simulator.safetyNotes')}
                  </p>
                  <ul className="mt-2 list-disc pl-4 text-sm text-primary/80">
                    {(simulationData?.data?.safetyNotes?.length
                      ? simulationData.data.safetyNotes
                      : selectedTemplate?.safetyNotes ?? []
                    ).map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-6">
            <div className="rounded-[2rem] border border-navy-200/50 bg-navy-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-navy-800 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    {t('simulator.sceneTitle')}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {selectedTemplate?.label ?? 'Room'}
                  </p>
                </div>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-white/80">
                  {t('simulator.exclusiveBadge')}
                </span>
              </div>
              <div className="aspect-[4/3] w-full md:aspect-[16/10]">
                <RoomScene
                  width={dimensions.width}
                  length={dimensions.length}
                  height={dimensions.height}
                  obstacles={selectedTemplate?.obstacles ?? []}
                  activeObstacleIds={selectedObstacleIds}
                  light={lightSettings}
                />
              </div>
              <div className="border-t border-navy-800 px-5 py-4 text-sm text-white/70">
                {t('simulator.sceneHint')}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {t('simulator.exclusiveBadge')}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-navy">
                {t('simulator.exclusiveTitle')}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                {t('simulator.exclusiveBody')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
