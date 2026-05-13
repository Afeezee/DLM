import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import RevealText from '../components/shared/RevealText'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import ProductCard from '../components/shared/ProductCard'
import { useCart } from '../hooks/useCart'
import { useFashionProducts } from '../hooks/useFashionProducts'
import { useMembership } from '../hooks/useMembership'
import { getFashionImage } from '../lib/catalog-visuals'
import { getPricing } from '../lib/pricing'
import { formatCurrency } from '../utils/formatCurrency'

export default function FashionPage() {
  const { categories, dataSource, error, isLoading, products } = useFashionProducts()
  const { itemCount } = useCart()
  const { isMember } = useMembership()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory
    const matchesSearch =
      searchTerm.trim() === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const selectedCategoryLabel =
    activeCategory === 'all'
      ? 'All styles'
      : categories.find((category) => category.key === activeCategory)?.label ?? activeCategory
  const showcaseProducts = (visibleProducts.length ? visibleProducts : products).slice(0, 3)
  const startingPrice = visibleProducts.length
    ? Math.min(...visibleProducts.map((product) => getPricing(product, isMember)))
    : null

  return (
    <section className="shell py-12 sm:py-16 lg:py-20">
      <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
        <div>
          <Badge tone="accent">Fashion picks</Badge>
          <RevealText
            amount={0.2}
            as="h1"
            className="mt-5 max-w-4xl text-5xl leading-[0.93] text-gradient sm:text-6xl"
            text="Shop standout looks, bags, and finishers in minutes."
          />
          <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-dark/72">
            Clean edits. Sharp prices. Fast checkout.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/fashion/checkout">
              <Button>Open checkout</Button>
            </Link>
            <div className="rounded-full bg-white/85 px-4 py-3 text-sm font-medium text-brand-dark/72 shadow-sm backdrop-blur-xl">
              {isMember ? 'Member pricing is on' : 'Standard pricing is on'}
            </div>
            <div className="rounded-full bg-brand-secondary/20 px-4 py-3 text-sm font-medium text-brand-dark/72">
              {itemCount} item{itemCount === 1 ? '' : 's'} in cart
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Category</p>
              <p className="mt-3 text-2xl font-display">{selectedCategoryLabel}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">From</p>
              <p className="mt-3 text-2xl font-display">
                {startingPrice === null ? 'Coming soon' : formatCurrency(startingPrice)}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Live view</p>
              <p className="mt-3 text-2xl font-display capitalize">
                {dataSource === 'fallback' ? 'Preview' : 'Live'}
              </p>
            </Card>
          </div>
          {error ? (
            <div className="mt-5 rounded-[24px] bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent">
              {error}
            </div>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          viewport={{ amount: 0.2, once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {showcaseProducts.map((product, index) => (
              <Card
                key={product.id}
                className={[
                  'group relative overflow-hidden border-white/70 p-0',
                  index === 0 ? 'sm:col-span-2' : '',
                ].join(' ')}
              >
                <div className={index === 0 ? 'h-[340px]' : 'h-[220px]'}>
                  <img
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    src={getFashionImage(product, index)}
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,18,12,0.08),rgba(24,18,12,0.78))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-brand-light">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-light/65">
                    {categories.find((entry) => entry.key === product.category)?.label ?? product.category}
                  </p>
                  <p className="mt-2 text-3xl font-display">{product.name}</p>
                  <p className="mt-3 text-sm font-medium text-brand-light/78">
                    {formatCurrency(getPricing(product, isMember))}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[300px_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.35 }}
          viewport={{ amount: 0.2, once: true }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <Card className="h-fit border-white/70 bg-white/75 p-6 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Find your next look</p>
          <Input
            label="Search products"
            name="search"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Kaftan, bags, footwear..."
            value={searchTerm}
          />

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Categories</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  activeCategory === 'all'
                    ? 'bg-brand-dark text-brand-light'
                    : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
                ].join(' ')}
                onClick={() => setActiveCategory('all')}
              >
                All products
              </button>
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    activeCategory === category.key
                      ? 'bg-brand-dark text-brand-light'
                      : 'bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary/35',
                  ].join(' ')}
                  onClick={() => setActiveCategory(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          </Card>
        </motion.div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-brand-dark/45">Now showing</p>
              <h2 className="mt-2 text-3xl">
                {isLoading ? 'Loading products...' : `${visibleProducts.length} styles ready to shop`}
              </h2>
            </div>
            <div className="rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-brand-dark/70 shadow-sm backdrop-blur-xl">
              {isMember ? 'Member savings highlighted' : 'Standard prices highlighted'}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="surface h-80 animate-pulse bg-white/70" />
              ))}
            </div>
          ) : visibleProducts.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                >
                  <ProductCard
                    category={categories.find((entry) => entry.key === product.category)?.label ?? product.category}
                    imageUrl={getFashionImage(product)}
                    memberPrice={product.member_price}
                    price={getPricing(product, isMember)}
                    standardPrice={product.standard_price}
                    stockQuantity={product.stock_quantity ?? 0}
                    title={product.name}
                    to={`/fashion/${product.id}`}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="mt-6 p-8">
              <h3 className="text-3xl">No matches yet</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-brand-dark/65">
                Clear the search or switch categories to see more looks.
              </p>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}