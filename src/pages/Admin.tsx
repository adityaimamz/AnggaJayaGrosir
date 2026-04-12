import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Shapes, 
  MessageCircle, 
  BarChart3, 
  Search, 
  Bell, 
  Plus, 
  ShoppingBag,
  CheckCircle2,
  Banknote,
  Filter,
  Download,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCircle
} from 'lucide-react';

export default function Admin() {
  return (
    <div className="flex h-screen bg-surface-container-low font-body overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#313030] text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tight font-headline">ANGGA JAYA</h1>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-xs font-bold text-white/50 tracking-widest uppercase mb-4">Main Menu</p>
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 bg-primary text-white px-4 py-3 rounded-xl font-bold transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium transition-colors">
              <Package className="w-5 h-5" />
              Produk
            </a>
            <a href="#" className="flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium transition-colors">
              <Shapes className="w-5 h-5" />
              Kategori
            </a>
            <a href="#" className="flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium transition-colors">
              <MessageCircle className="w-5 h-5" />
              Pesanan WA
            </a>
            <a href="#" className="flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium transition-colors">
              <BarChart3 className="w-5 h-5" />
              Stok
            </a>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <UserCircle className="w-10 h-10 text-white/70" />
            <div>
              <p className="font-bold text-sm">Admin Utama</p>
              <p className="text-xs text-white/50">Grosir Curator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="py-6 px-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl xl:text-3xl font-black font-headline text-on-surface whitespace-nowrap">Admin Dashboard</h2>
            <p className="text-on-surface-variant font-medium text-sm xl:text-base">Welcome back, here's what's happening today.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
              <input 
                type="text" 
                placeholder="Cari data..." 
                className="pl-12 pr-4 py-3 bg-surface-container-highest border-none rounded-xl w-48 xl:w-64 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>
            <button className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-surface-container-highest rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm whitespace-nowrap flex-shrink-0">
              <Plus className="w-5 h-5" />
              Tambah Produk
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-black/5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-tertiary font-bold text-sm">+12.5%</span>
              </div>
              <p className="text-on-surface-variant font-medium text-sm mb-1">Total Produk</p>
              <h3 className="text-3xl font-black font-headline text-on-surface">1,284</h3>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-black/5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-tertiary font-bold text-sm">+4.2%</span>
              </div>
              <p className="text-on-surface-variant font-medium text-sm mb-1">Chat WhatsApp</p>
              <h3 className="text-3xl font-black font-headline text-on-surface">56</h3>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-black/5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed-dim flex items-center justify-center text-tertiary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-primary font-bold text-sm">-2.1%</span>
              </div>
              <p className="text-on-surface-variant font-medium text-sm mb-1">Stok Aman</p>
              <h3 className="text-3xl font-black font-headline text-on-surface">92%</h3>
            </div>

            <div className="bg-[#313030] p-6 rounded-2xl shadow-sm text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Banknote className="w-6 h-6" />
                </div>
                <span className="text-secondary-fixed font-bold text-sm">Rp</span>
              </div>
              <p className="text-white/70 font-medium text-sm mb-1">Estimasi Nilai Stok</p>
              <h3 className="text-3xl font-black font-headline text-white">Rp 450.2M</h3>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-black/5 p-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 mb-8">
              <div>
                <h3 className="text-xl xl:text-2xl font-black font-headline text-on-surface mb-1">Manajemen Produk</h3>
                <p className="text-on-surface-variant font-medium text-sm xl:text-base">Kelola katalog grosir dan inventaris stok Anda.</p>
              </div>
              <div className="flex gap-3 w-full xl:w-auto overflow-x-auto hide-scrollbar pb-2 xl:pb-0">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-colors whitespace-nowrap flex-shrink-0">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-colors whitespace-nowrap flex-shrink-0">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-surface-container-highest">
                    <th className="pb-4 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Produk</th>
                    <th className="pb-4 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Kategori</th>
                    <th className="pb-4 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Ukuran</th>
                    <th className="pb-4 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Harga Grosir</th>
                    <th className="pb-4 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Stok</th>
                    <th className="pb-4 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {/* Row 1 */}
                  <tr className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden">
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLRMRuKbDGREC5Nglv6tbvO8ylyvsE08ICPKrU1tLRRIquIx8dQ9UwIYv-vIEZmy9aRdW5hxiCkuBi8Nt-lF3cLqnjD_gkZHGaZqgvKRT554jTDo9bd0TYIhSSu5flLQ1KZBPJeRuKlutgdIQcr6DKJhAmnLTCrilj3yL0tkZXaxU7THbybkD-UcaUGJF0bcTYn5P2jNUHowAiQd8JN0lN2DRdHl8Ox95az5l9Xyvc1b3hWUkvzHtp0Hn0xxFNb30o9qOdMvUCwZw" alt="Boxer Premium S7" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">Boxer Premium S7</p>
                          <p className="text-xs text-on-surface-variant">ID: AJ-00921</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant">Pria</span>
                    </td>
                    <td className="py-4 font-medium text-sm">L, XL, XXL</td>
                    <td className="py-4 font-bold text-sm">Rp 125.000 /lsn</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                        <span className="font-bold text-sm">428 Lusin</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-surface-container-low hover:bg-surface-container-highest rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-on-surface-variant" />
                        </button>
                        <button className="p-2 bg-surface-container-low hover:bg-error-container text-error rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden">
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQCZosaSPXsdDzM3ECCuvr5Z_fz3wrhmBHlb9EOb5M3e7IVokK0Z-yCSMiZsuO6dCJZCsY5CuZv0OvMy_MvDpdjIkWsp-bAFl24qjAeJL3mmrHYV2-361gbDowrTlowOG6njM4bbx96p28A6SoWUKSPJTI9Lc4s6QpOrXlg10xilD90DJXfCt6-KhjCrCU6ya2fWF0YcfxTO4t4KlULV0Y7hEhITXLHOoC2qyOwM-6exiIMiYsBkVKDVY8QR04p9fgUdzqg9AEmn0" alt="Brief Comfort Lace" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">Brief Comfort Lace</p>
                          <p className="text-xs text-on-surface-variant">ID: AJ-00442</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant">Wanita</span>
                    </td>
                    <td className="py-4 font-medium text-sm">M, L</td>
                    <td className="py-4 font-bold text-sm">Rp 98.000 /lsn</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                        <span className="font-bold text-sm">12 Lusin</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-surface-container-low hover:bg-surface-container-highest rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-on-surface-variant" />
                        </button>
                        <button className="p-2 bg-surface-container-low hover:bg-error-container text-error rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden">
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8mMGKOod-MeaEwcRYwhSw31k9WB73kU71qvtuNzXS19LmLUqmaIAv3GYH966twffVLqD81WOJNt_LgzFC8UNlKCqEkO-kDX4xnorRRz-gUnS4d61FfraNhdbYkK_fCaQlyul6yqNDU3itp1W1UI320RF5fI2FNsfl0Pp8UminDt9RMBot3vl1LxzXuzuuO06-DepIbpS631oRwwbdnS-YuuX_2p0NiQqvaSk1JgVrvbdwW64TgZWX8BruoiJvHvlCQpQqDD_Hj7Q" alt="Kaos Dalam Anak Junior" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">Kaos Dalam Anak Junior</p>
                          <p className="text-xs text-on-surface-variant">ID: AJ-00125</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant">Anak</span>
                    </td>
                    <td className="py-4 font-medium text-sm">S, M, L</td>
                    <td className="py-4 font-bold text-sm">Rp 65.000 /lsn</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                        <span className="font-bold text-sm">890 Lusin</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-surface-container-low hover:bg-surface-container-highest rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-on-surface-variant" />
                        </button>
                        <button className="p-2 bg-surface-container-low hover:bg-error-container text-error rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-container-highest">
              <p className="text-sm text-on-surface-variant font-medium">Menampilkan 1-10 dari 1,284 produk</p>
              <div className="flex gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold transition-colors">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent text-on-surface font-bold hover:bg-surface-container-low transition-colors">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent text-on-surface font-bold hover:bg-surface-container-low transition-colors">
                  3
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 flex justify-between items-center text-sm text-on-surface-variant font-medium">
            <p>© 2024 ANGGA JAYA Grosir. The Heritage Curator.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Wholesale Guide</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
