
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          price: number
          category: string
          description: string | null
          image: string
          barcode: string | null
          in_stock: number
          store_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          price: number
          category: string
          description?: string | null
          image: string
          barcode?: string | null
          in_stock: number
          store_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          category?: string
          description?: string | null
          image?: string
          barcode?: string | null
          in_stock?: number
          store_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          notes: string | null
          total_orders: number | null
          total_spent: number | null
          registration_date: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          notes?: string | null
          total_orders?: number | null
          total_spent?: number | null
          registration_date?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          notes?: string | null
          total_orders?: number | null
          total_spent?: number | null
          registration_date?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          customer_name: string | null
          date: string
          total: number
          tax: number | null
          payment_method: string
          notes: string | null
          status: string
          store_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          customer_name?: string | null
          date: string
          total: number
          tax?: number | null
          payment_method: string
          notes?: string | null
          status: string
          store_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          customer_name?: string | null
          date?: string
          total?: number
          tax?: number | null
          payment_method?: string
          notes?: string | null
          status?: string
          store_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          price: number
          quantity: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          price: number
          quantity: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          price?: number
          quantity?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      payment_methods: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          hours: string
          employees: number
          image: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          hours: string
          employees: number
          image?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          hours?: string
          employees?: number
          image?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          name: string
          value: string
          category: string
          description: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          value: string
          category: string
          description: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          value?: string
          category?: string
          description?: string
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
