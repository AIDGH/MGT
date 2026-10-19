<?php
get_header();
$search = isset($_GET['q']) && is_string($_GET['q']) ? mb_substr(sanitize_text_field(wp_unslash($_GET['q'])), 0, 150) : '';
$category = isset($_GET['category']) && is_string($_GET['category']) ? sanitize_title(wp_unslash($_GET['category'])) : '';
$page = isset($_GET['pg']) && is_scalar($_GET['pg']) ? max(1, absint($_GET['pg'])) : max(1, (int) get_query_var('paged'));
$products = mgt_catalog_query($search, $category, $page);
$categories = get_terms(['taxonomy'=>'mgt_category','hide_empty'=>false]);
if (is_wp_error($categories)) $categories = [];
?>
<main id="main" class="catalog-main"><div class="shell catalog-content"><div class="catalog-heading"><span class="section-kicker">MGT / <?php echo esc_html(mgt_text('کاتالوگ','CATALOGUE')); ?></span><h1><?php echo esc_html(mgt_text('محصولات ما','Our products')); ?></h1><p><?php echo esc_html(mgt_text('قطعات خودرو را مرور کنید و برای مشخصات و شرایط تأمین با ما در تماس باشید.','Browse our automotive parts and contact us for specifications and supply enquiries.')); ?></p></div>
<form class="catalog-filters" action="<?php echo esc_url(home_url('/products/')); ?>" method="get">
<?php if (mgt_en()): ?><input type="hidden" name="lang" value="en"><?php endif; ?>
<label><?php echo esc_html(mgt_text('جست‌وجو','Search')); ?><input name="q" value="<?php echo esc_attr($search); ?>" maxlength="150" placeholder="<?php echo esc_attr(mgt_text('نام یا شماره قطعه','Name or part number')); ?>"></label>
<label><?php echo esc_html(mgt_text('دسته‌بندی','Category')); ?><select name="category"><option value=""><?php echo esc_html(mgt_text('همه دسته‌ها','All categories')); ?></option><?php foreach ($categories as $term): ?><option value="<?php echo esc_attr($term->slug); ?>" <?php selected($category, $term->slug); ?>><?php echo esc_html(mgt_category_name($term)); ?></option><?php endforeach; ?></select></label><button class="gold-button"><?php echo esc_html(mgt_text('نمایش محصولات','Find products')); ?></button></form>
<?php if (!$products->have_posts()): ?>
<div class="catalog-empty"><h2><?php echo esc_html($search!=='' || $category!=='' ? mgt_text('محصولی پیدا نشد','No matching products') : mgt_text('کاتالوگ محصولات در حال تکمیل است','Our catalogue is being prepared')); ?></h2><p><?php echo esc_html(mgt_text('برای اطلاع از تأمین قطعات موردنیازتان با ما در تماس باشید.','Contact us to discuss the parts you need.')); ?></p><a class="gold-button" href="<?php echo esc_url(mgt_url('/#contact')); ?>"><?php echo esc_html(mgt_text('تماس با ما','Contact us')); ?></a></div>
<?php else: ?>
<p class="result-count"><?php echo esc_html($products->found_posts . ' ' . mgt_text('محصول','products')); ?></p><div class="product-grid">
<?php while ($products->have_posts()): $products->the_post(); $id = get_the_ID(); $images = mgt_images($id); $terms = get_the_terms($id, 'mgt_category'); $term = $terms && !is_wp_error($terms) ? $terms[0] : null; ?>
<a class="product-card" href="<?php echo esc_url(mgt_permalink($id)); ?>"><div class="product-image"><?php if ($images): ?><img loading="lazy" src="<?php echo esc_url($images[0]); ?>" alt="<?php echo esc_attr(mgt_name($id)); ?>"><?php endif; ?></div><div class="product-card-copy"><span><?php echo esc_html($term ? mgt_category_name($term):'MGT'); ?></span><h2><?php echo esc_html(mgt_name($id)); ?></h2><?php if (mgt_meta($id,'sku')): ?><p dir="ltr"><?php echo esc_html(mgt_meta($id,'sku')); ?></p><?php endif; ?><span class="product-more"><?php echo esc_html(mgt_text('مشاهده مشخصات ←','View details →')); ?></span></div></a>
<?php endwhile; wp_reset_postdata(); ?></div>
<?php if ($products->max_num_pages>1): $base = add_query_arg(['q'=>$search,'category'=>$category],mgt_url('/products/')); ?>
<nav class="pagination" aria-label="<?php echo esc_attr(mgt_text('صفحه‌بندی','Pagination')); ?>"><?php if ($page>1): ?><a href="<?php echo esc_url(add_query_arg('pg',$page-1,$base)); ?>"><?php echo esc_html(mgt_text('قبلی','Previous')); ?></a><?php endif; ?><span><?php echo esc_html($page . ' / ' . $products->max_num_pages); ?></span><?php if ($page<$products->max_num_pages): ?><a href="<?php echo esc_url(add_query_arg('pg',$page+1,$base)); ?>"><?php echo esc_html(mgt_text('بعدی','Next')); ?></a><?php endif; ?></nav>
<?php endif; endif; ?></div></main><?php get_footer(); ?>
